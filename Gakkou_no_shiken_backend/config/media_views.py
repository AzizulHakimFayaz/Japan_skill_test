"""
HTTP 206 Partial Content (Range) media file server for fast MP4/WebM video & MP3 audio streaming.

- Supports standard browser `Range: bytes=start-end` requests so `<video>` starts in ~1s and seeks instantly.
- Caps open-ended `bytes=start-` responses to 2 MB chunks so shared-hosting WSGI/Passenger workers never block.
- Falls back to Django's standard `serve()` for non-range requests (images, PDFs, etc.) with `Accept-Ranges: bytes`.
- Uses `safe_join` to strictly prevent path traversal outside `MEDIA_ROOT`.
"""

import mimetypes
import os
import re

from django.http import Http404, HttpResponse, StreamingHttpResponse
from django.utils._os import safe_join
from django.views.static import serve as django_static_serve

RANGE_RE = re.compile(r'bytes=(\d+)-(\d*)')
STREAM_CHUNK_SIZE = 64 * 1024          # 64 KB read buffer
MAX_OPEN_RANGE_BYTES = 2 * 1024 * 1024  # 2 MB max per open-ended range request


def _file_chunk_iterator(file_path: str, offset: int, length: int, chunk_size: int = STREAM_CHUNK_SIZE):
    with open(file_path, 'rb') as f:
        f.seek(offset)
        remaining = length
        while remaining > 0:
            data = f.read(min(chunk_size, remaining))
            if not data:
                break
            remaining -= len(data)
            yield data


def serve_media_with_range(request, path, document_root=None):
    if not document_root:
        raise Http404('Media root not configured.')

    try:
        full_path = safe_join(document_root, path)
    except ValueError:
        raise Http404('Invalid media path.')

    if not os.path.isfile(full_path):
        raise Http404('Media file not found.')

    range_header = request.META.get('HTTP_RANGE', '').strip()
    if not range_header:
        response = django_static_serve(request, path, document_root=document_root)
        response['Accept-Ranges'] = 'bytes'
        return response

    match = RANGE_RE.match(range_header)
    if not match:
        response = django_static_serve(request, path, document_root=document_root)
        response['Accept-Ranges'] = 'bytes'
        return response

    file_size = os.path.getsize(full_path)
    start = int(match.group(1))
    end_str = match.group(2)

    if start >= file_size:
        resp = HttpResponse(status=416)
        resp['Content-Range'] = f'bytes */{file_size}'
        return resp

    if end_str:
        end = min(int(end_str), file_size - 1)
    else:
        # Cap open-ended `bytes=0-` requests to 2 MB so playback starts fast & workers stay free
        end = min(start + MAX_OPEN_RANGE_BYTES - 1, file_size - 1)

    if end < start:
        resp = HttpResponse(status=416)
        resp['Content-Range'] = f'bytes */{file_size}'
        return resp

    length = end - start + 1
    content_type, _ = mimetypes.guess_type(full_path)
    content_type = content_type or 'application/octet-stream'

    response = StreamingHttpResponse(
        _file_chunk_iterator(full_path, start, length),
        status=206,
        content_type=content_type,
    )
    response['Content-Length'] = str(length)
    response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
    response['Accept-Ranges'] = 'bytes'
    response['Cache-Control'] = 'public, max-age=86400'
    return response
