<?php
session_start();
$db = new SQLite3('database.sqlite');

$data = json_decode(file_get_contents('php://input'), true);
$windowId = $data['windowId'];
$state = $data['state'];
$userId = $_SESSION['user']['id'];

$tabs = json_encode($state['tabs']);

$stmt = $db->prepare("INSERT OR REPLACE INTO windows (id, user_id, top, left, width, height, tabs) VALUES (:id, :user_id, :top, :left, :width, :height, :tabs)");
$stmt->bindValue(':id', $windowId, SQLITE3_INTEGER);
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$stmt->bindValue(':top', $state['top'], SQLITE3_TEXT);
$stmt->bindValue(':left', $state['left'], SQLITE3_TEXT);
$stmt->bindValue(':width', $state['width'], SQLITE3_TEXT);
$stmt->bindValue(':height', $state['height'], SQLITE3_TEXT);
$stmt->bindValue(':tabs', $tabs, SQLITE3_TEXT);
$stmt->execute();
?>

