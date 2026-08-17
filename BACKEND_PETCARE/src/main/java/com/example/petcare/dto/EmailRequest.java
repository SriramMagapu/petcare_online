package com.example.petcare.dto;

/**
 * DTO used for send-otp requests from the client.
 * Contains optional flags for login/register flows and a password field used during login.
 */
public class EmailRequest {

    private String email;
    private Boolean login;
    private Boolean register;
    private String password; // <-- added so controller can verify password before sending OTP

    public EmailRequest() {}

    public EmailRequest(String email, Boolean login, Boolean register, String password) {
        this.email = email;
        this.login = login;
        this.register = register;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Boolean isLogin() {
        return login != null && login;
    }

    public void setLogin(Boolean login) {
        this.login = login;
    }

    public Boolean isRegister() {
        return register != null && register;
    }

    public void setRegister(Boolean register) {
        this.register = register;
    }

    // password getter/setter required by AuthController
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
