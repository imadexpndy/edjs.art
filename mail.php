<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $email_content = "New Form Submission:\n\n";

    foreach ($_POST as $key => $value) {
        if (is_array($value)) {
            $value = implode(", ", $value);
        }
        $label = ucwords(str_replace(["-", "_"], " ", $key));
        $email_content .= "$label: $value\n";
    }

    // Handle uploaded files
    if (!empty($_FILES)) {
        foreach ($_FILES as $field => $file) {
            if ($file['error'] === UPLOAD_ERR_OK) {
                $email_content .= "File Uploaded - $field: " . $file['name'] . "\n";
            }
        }
    }

    // Set recipient and subject
    $to = "your-email@example.com"; // UPDATE THIS WITH YOUR EMAIL
    $subject = "New Submission from Toddly Website";
    $headers = "From: Toddly Website <no-reply@" . $_SERVER['SERVER_NAME'] . ">";

    if (mail($to, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo "✅ Thank you! Your form has been submitted successfully.";
    } else {
        http_response_code(500);
        echo "❌ Sorry, we couldn't send your message. Try again later.";
    }
} else {
    http_response_code(403);
    echo "Forbidden: Invalid request.";
}
