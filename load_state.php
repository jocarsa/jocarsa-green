<?php
session_start();
$db = new SQLite3('database.sqlite');

$userId = $_SESSION['user']['id'];

$stmt = $db->prepare("SELECT * FROM windows WHERE user_id = :user_id");
$stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
$result = $stmt->execute();

$windows = [];
while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    $row['tabs'] = json_decode($row['tabs'], true);
    $windows[] = $row;
}

echo json_encode($windows);
?>

