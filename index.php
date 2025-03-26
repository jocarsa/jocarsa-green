<?php
session_start();
$db = new SQLite3('database.sqlite');

// Create users table if not exists
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)");

// Create windows table if not exists
$db->exec("CREATE TABLE IF NOT EXISTS windows (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    top TEXT NOT NULL,
    left TEXT NOT NULL,
    width TEXT NOT NULL,
    height TEXT NOT NULL,
    tabs TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
)");

// Insert initial user if not exists
$db->exec("INSERT OR IGNORE INTO users (name, email, username, password) VALUES ('Jose Vicente Carratala', 'info@josevicentecarratala.com', 'jocarsa', 'jocarsa')");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = $_POST['username'];
    $password = $_POST['password'];
    $stmt = $db->prepare("SELECT * FROM users WHERE username = :username AND password = :password");
    $stmt->bindValue(':username', $username, SQLITE3_TEXT);
    $stmt->bindValue(':password', $password, SQLITE3_TEXT);
    $result = $stmt->execute();
    $user = $result->fetchArray();

    if ($user) {
        $_SESSION['user'] = $user;
    } else {
        $error = "Invalid credentials";
    }
}

if (isset($_SESSION['user'])) {
    // Logged in, show desktop
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Multiuser OS</title>
        <link rel="stylesheet" href="css/styles.css">
    </head>
    <body>
        <div id="desktop">
            <div id="launcher">
                <button onclick="openWebBrowser()">Web Browser</button>
            </div>
            <div id="taskbar"></div>
        </div>
        <script src="js/scripts.js"></script>
    </body>
    </html>
    <?php
} else {
    // Show login form
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login</title>
        <link rel="stylesheet" href="css/styles.css">
    </head>
    <body>
        <div id="login-form">
            <form method="POST" action="index.php">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button type="submit">Login</button>
                <?php if (isset($error)): ?>
                    <p><?php echo $error; ?></p>
                <?php endif; ?>
            </form>
        </div>
    </body>
    </html>
    <?php
}
?>

