<?php

$user_email = filter_var($_GET['user_email'], FILTER_SANITIZE_EMAIL);
$user_comment = filter_var($_GET['user_comment'], FILTER_SANITIZE_STRING);

$to      = 'tempranova@gmail.com';
$subject = 'Native-Land.ca ';
if(isset($_GET['user_source'])) {
    $user_source = filter_var($_GET['user_source'], FILTER_SANITIZE_STRING);
    $message = $user_comment . '<br /><br />Source: ' . $user_source;
    $headers = 'From: '.$user_email . "\r\n" .
        'Reply-To: '.$user_email . "\r\n" .
        'X-Mailer: PHP/' . phpversion();
} else {
    $message = $user_comment;
    $headers = 'From: '.$user_email . "\r\n" .
        'Reply-To: '.$user_email . "\r\n" .
        'X-Mailer: PHP/' . phpversion();
}

mail($to, $subject, $message, $headers);
?> 