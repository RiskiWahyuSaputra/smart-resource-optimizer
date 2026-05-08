<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1", "root", "");
    $pdo->exec("CREATE DATABASE IF NOT EXISTS smart_resource_optimizer");
    echo "Database created or already exists.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
