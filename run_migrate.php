<?php
header('Content-Type: text/plain');

echo "=== 1. RUNNING DJANGO MIGRATIONS ===\n";
$cmd1 = '/home/gakkouno/virtualenv/backend/3.11/bin/python /home/gakkouno/backend/manage.py migrate 2>&1';
$res1 = shell_exec($cmd1);
echo $res1 ? $res1 : "No output or failed\n";

echo "\n=== 2. CREATING/UPDATING ADMIN SUPERUSER ===\n";
$cmd2 = '/home/gakkouno/virtualenv/backend/3.11/bin/python /home/gakkouno/backend/create_superuser.py 2>&1';
$res2 = shell_exec($cmd2);
echo $res2 ? $res2 : "No output or failed\n";

echo "\n=== ALL DONE! You can now log into /admin ===\n";
?>
