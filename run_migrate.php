<?php
header('Content-Type: text/plain');

echo "=== [1/2] INSTALLING PIP REQUIREMENTS ===\n";
$cmd0 = '/home/gakkouno/virtualenv/backend/3.11/bin/pip install -r /home/gakkouno/backend/requirements.txt 2>&1';
$res0 = shell_exec($cmd0);
echo $res0 ? $res0 : "No output or failed\n";

echo "\n=== [2/2] RUNNING DJANGO MIGRATIONS ===\n";
$cmd1 = '/home/gakkouno/virtualenv/backend/3.11/bin/python /home/gakkouno/backend/manage.py migrate 2>&1';
$res1 = shell_exec($cmd1);
echo $res1 ? $res1 : "No output or failed\n";

echo "\n=== ALL DONE! Database is migrated and updated! ===\n";
?>
