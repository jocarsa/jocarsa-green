<?php
session_start();
$db = new SQLite3('database.sqlite');

$data = json_decode(file_get_contents('php://input'), true);
$windowId = $data['windowId'];
$userId = $_SESSION['user']['id'];

$stmt = $db->prepare("DELETE FROM windows WHERE id = :id AND user_id = :user_id");
$stmt->bindValue(':id', $windowId, SQLITE3_INTEGER);
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->execute();
?>

