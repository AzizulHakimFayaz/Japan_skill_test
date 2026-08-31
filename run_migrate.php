<?php
header('Content-Type: text/plain');

echo "==========================================\n";
echo "   GAKKOU NO SHIKEN - SERVER UTILITY      \n";
echo "==========================================\n\n";

echo "=== [1/3] INSTALLING PIP REQUIREMENTS ===\n";
$cmd0 = '/home/gakkouno/virtualenv/backend/3.11/bin/pip install -r /home/gakkouno/backend/requirements.txt 2>&1';
$res0 = shell_exec($cmd0);
echo $res0 ? $res0 : "No output or failed\n";

echo "\n=== [2/3] RUNNING DJANGO MIGRATIONS ===\n";
$cmd1 = '/home/gakkouno/virtualenv/backend/3.11/bin/python /home/gakkouno/backend/manage.py migrate 2>&1';
$res1 = shell_exec($cmd1);
echo $res1 ? $res1 : "No output or failed\n";

// Optional Admin Password Reset
$new_pass = isset($_GET['new_pass']) ? $_GET['new_pass'] : 'admin12345';
echo "\n=== [3/3] SETTING ADMIN SUPERUSER CREDENTIALS ===\n";
$escaped_pass = escapeshellarg($new_pass);
$cmd2 = "/home/gakkouno/virtualenv/backend/3.11/bin/python /home/gakkouno/backend/manage.py shell -c \"from accounts.models import User; u, _ = User.objects.get_or_create(username='admin', defaults={'email':'admin@example.com', 'is_staff':True, 'is_superuser':True}); u.set_password($escaped_pass); u.is_staff=True; u.is_superuser=True; u.save(); print('SUCCESS: Superuser admin password set to: ' + repr($escaped_pass))\" 2>&1";
$res2 = shell_exec($cmd2);
echo $res2 ? $res2 : "Password set command executed.\n";

echo "\n==========================================\n";
echo "ALL DONE! You can now log in at /admin/\n";
echo "Username: admin\n";
echo "Password: " . $new_pass . "\n";
echo "==========================================\n";
?>
