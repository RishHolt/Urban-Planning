<?php
namespace PHPMailer\PHPMailer;

class PHPMailer {
    public $Host = "";
    public $Port = 25;
    public $SMTPAuth = false;
    public $Username = "";
    public $Password = "";
    public $SMTPSecure = "";
    public $isSMTP = false;
    public $Subject = "";
    public $Body = "";
    public $AltBody = "";
    public $From = "";
    public $FromName = "";
    public $addAddress = [];
    public $addReplyTo = [];
    public $SMTPDebug = 0;
    
    public function isSMTP() { 
        $this->isSMTP = true; 
        return $this;
    }
    
    public function setFrom($email, $name = "") { 
        $this->From = $email; 
        $this->FromName = $name; 
        return $this;
    }
    
    public function addAddress($email, $name = "") { 
        $this->addAddress[] = $email; 
        return $this;
    }
    
    public function addReplyTo($email, $name = "") { 
        $this->addReplyTo[] = $email; 
        return $this;
    }
    
    public function isHTML($ishtml = true) { 
        return $this;
    }
    
    public function send() { 
        // Use PHP's built-in mail function as fallback
        if (empty($this->addAddress)) {
            return false;
        }
        
        $to = $this->addAddress[0];
        $subject = $this->Subject;
        $message = $this->Body;
        
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: " . $this->FromName . " <" . $this->From . ">" . "\r\n";
        
        if (!empty($this->addReplyTo)) {
            $headers .= "Reply-To: " . $this->addReplyTo[0] . "\r\n";
        }
        
        return mail($to, $subject, $message, $headers);
    }
}