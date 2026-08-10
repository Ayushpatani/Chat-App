// ```jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                "http://localhost:8000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                }
            );

            const json = await response.json();

            if (json.success) {
                localStorage.setItem("token", json.authtoken);
                navigate("/chat");
            } else {
                alert("Invalid credentials.");
            }
        } catch (error) {
            console.error(error);
            alert("Unable to connect to the server.");
        }
    };

    const onChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <>
            <style>{`
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Inter, -apple-system, BlinkMacSystemFont,
                        "Segoe UI", sans-serif;
                }

                .login-page {
                    min-height: 100vh;
                    display: flex;
                    background: #08090d;
                    color: white;
                    overflow: hidden;
                }

                /* LEFT SIDE */

                .login-left {
                    width: 52%;
                    min-height: 100vh;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    padding: 70px;
                    background:
                        radial-gradient(
                            circle at 20% 20%,
                            rgba(99, 102, 241, 0.35),
                            transparent 35%
                        ),
                        radial-gradient(
                            circle at 80% 80%,
                            rgba(168, 85, 247, 0.25),
                            transparent 35%
                        ),
                        #08090d;
                }

                .login-left-content {
                    max-width: 620px;
                    position: relative;
                    z-index: 2;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 90px;
                }

                .brand-icon {
                    width: 46px;
                    height: 46px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    font-weight: 800;
                    background: linear-gradient(
                        135deg,
                        #6366f1,
                        #a855f7
                    );
                    box-shadow: 0 10px 35px rgba(99, 102, 241, 0.35);
                }

                .brand-name {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                .hero-title {
                    font-size: clamp(48px, 5vw, 76px);
                    line-height: 1.02;
                    letter-spacing: -4px;
                    font-weight: 800;
                    margin: 0 0 28px;
                }

                .hero-title span {
                    background: linear-gradient(
                        90deg,
                        #818cf8,
                        #c084fc,
                        #e879f9
                    );
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-description {
                    color: #a1a1aa;
                    font-size: 18px;
                    line-height: 1.7;
                    max-width: 510px;
                    margin-bottom: 45px;
                }

                .features {
                    display: flex;
                    gap: 30px;
                    flex-wrap: wrap;
                }

                .feature {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #d4d4d8;
                    font-size: 14px;
                }

                .feature-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #818cf8;
                    box-shadow: 0 0 15px #818cf8;
                }

                /* DECORATIVE SHAPES */

                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(1px);
                    pointer-events: none;
                }

                .orb-one {
                    width: 300px;
                    height: 300px;
                    right: -100px;
                    top: -100px;
                    background: rgba(99, 102, 241, 0.08);
                    border: 1px solid rgba(129, 140, 248, 0.15);
                }

                .orb-two {
                    width: 450px;
                    height: 450px;
                    left: -250px;
                    bottom: -250px;
                    background: rgba(168, 85, 247, 0.06);
                    border: 1px solid rgba(168, 85, 247, 0.12);
                }

                /* RIGHT SIDE */

                .login-right {
                    width: 48%;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    background: #101116;
                    border-left: 1px solid rgba(255, 255, 255, 0.06);
                }

                .login-box {
                    width: 100%;
                    max-width: 430px;
                }

                .login-heading {
                    margin-bottom: 38px;
                }

                .login-heading h1 {
                    font-size: 34px;
                    letter-spacing: -1.5px;
                    margin: 0 0 10px;
                    font-weight: 750;
                }

                .login-heading p {
                    margin: 0;
                    color: #71717a;
                    font-size: 15px;
                }

                .input-group {
                    margin-bottom: 22px;
                }

                .input-group label {
                    display: block;
                    color: #d4d4d8;
                    font-size: 13px;
                    font-weight: 600;
                    margin-bottom: 9px;
                }

                .input-wrapper {
                    position: relative;
                }

                .input-icon {
                    position: absolute;
                    left: 17px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #71717a;
                    font-size: 17px;
                }

                .modern-input {
                    width: 100%;
                    height: 56px;
                    border-radius: 13px;
                    border: 1px solid #27272a;
                    background: #18191f;
                    color: white;
                    padding: 0 16px 0 48px;
                    outline: none;
                    font-size: 15px;
                    transition: all 0.2s ease;
                }

                .modern-input::placeholder {
                    color: #52525b;
                }

                .modern-input:focus {
                    border-color: #6366f1;
                    background: #1b1c23;
                    box-shadow:
                        0 0 0 3px rgba(99, 102, 241, 0.12),
                        0 10px 30px rgba(0, 0, 0, 0.15);
                }

                .login-options {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin: 5px 0 25px;
                }

                .remember {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #71717a;
                    font-size: 13px;
                }

                .remember input {
                    accent-color: #6366f1;
                }

                .forgot {
                    color: #818cf8;
                    font-size: 13px;
                    cursor: pointer;
                }

                .login-button {
                    width: 100%;
                    height: 56px;
                    border: none;
                    border-radius: 13px;
                    background: linear-gradient(
                        135deg,
                        #6366f1,
                        #8b5cf6
                    );
                    color: white;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.25s ease;
                    box-shadow:
                        0 12px 30px rgba(99, 102, 241, 0.2);
                }

                .login-button:hover {
                    transform: translateY(-2px);
                    box-shadow:
                        0 18px 40px rgba(99, 102, 241, 0.3);
                }

                .login-button:active {
                    transform: translateY(0);
                }

                .divider {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin: 30px 0;
                    color: #52525b;
                    font-size: 12px;
                }

                .divider::before,
                .divider::after {
                    content: "";
                    flex: 1;
                    height: 1px;
                    background: #27272a;
                }

                .signup {
                    text-align: center;
                    color: #71717a;
                    font-size: 14px;
                }

                .signup span {
                    color: #a5b4fc;
                    font-weight: 600;
                    cursor: pointer;
                    margin-left: 4px;
                }

                .signup span:hover {
                    color: #c4b5fd;
                }

                .security {
                    margin-top: 35px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 7px;
                    color: #52525b;
                    font-size: 12px;
                }

                /* RESPONSIVE */

                @media (max-width: 900px) {
                    .login-page {
                        display: block;
                    }

                    .login-left {
                        width: 100%;
                        min-height: auto;
                        padding: 35px 30px;
                    }

                    .login-left-content {
                        max-width: 100%;
                    }

                    .brand {
                        margin-bottom: 55px;
                    }

                    .hero-title {
                        font-size: 48px;
                        letter-spacing: -2.5px;
                    }

                    .hero-description {
                        font-size: 16px;
                        margin-bottom: 30px;
                    }

                    .login-right {
                        width: 100%;
                        min-height: auto;
                        border-left: none;
                        border-top: 1px solid rgba(255,255,255,0.06);
                        padding: 55px 30px;
                    }
                }

                @media (max-width: 500px) {
                    .login-left {
                        padding: 28px 22px;
                    }

                    .brand {
                        margin-bottom: 45px;
                    }

                    .hero-title {
                        font-size: 42px;
                    }

                    .features {
                        gap: 15px;
                    }

                    .login-right {
                        padding: 45px 22px;
                    }

                    .login-heading h1 {
                        font-size: 29px;
                    }
                }
            `}</style>

            <div className="login-page">

                {/* LEFT SECTION */}
                <section className="login-left">

                    <div className="orb orb-one"></div>
                    <div className="orb orb-two"></div>

                    <div className="login-left-content">

                        <div className="brand">
                            <div className="brand-icon">C</div>
                            <div className="brand-name">Chatting</div>
                        </div>

                        <h2 className="hero-title">
                            Talk to people.
                            <br />
                            <span>Connect instantly.</span>
                        </h2>

                        <p className="hero-description">
                            A simple and powerful real-time messaging
                            experience. Stay connected with your friends
                            and conversations from anywhere.
                        </p>

                        <div className="features">
                            <div className="feature">
                                <div className="feature-dot"></div>
                                Real-time messaging
                            </div>

                            <div className="feature">
                                <div className="feature-dot"></div>
                                Secure authentication
                            </div>

                            <div className="feature">
                                <div className="feature-dot"></div>
                                Fast & reliable
                            </div>
                        </div>

                    </div>
                </section>

                {/* RIGHT SECTION */}
                <section className="login-right">

                    <div className="login-box">

                        <div className="login-heading">
                            <h1>Welcome back</h1>
                            <p>
                                Enter your details to access your account.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* EMAIL */}
                            <div className="input-group">
                                <label htmlFor="email">
                                    Email address
                                </label>

                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        @
                                    </span>

                                    <input
                                        className="modern-input"
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={credentials.email}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="input-group">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <div className="input-wrapper">
                                    <span className="input-icon">
                                        ●
                                    </span>

                                    <input
                                        className="modern-input"
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={credentials.password}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="login-options">

                                <label className="remember">
                                    <input type="checkbox" />
                                    Remember me
                                </label>

                                <span className="forgot">
                                    Forgot password?
                                </span>

                            </div>

                            <button
                                type="submit"
                                className="login-button"
                            >
                                Sign in
                            </button>

                        </form>

                        <div className="divider">
                            OR
                        </div>

                        <div className="signup">
                            Don't have an account?
                            <span onClick={() => navigate("/")}>
                                Create account
                            </span>
                        </div>

                        <div className="security">
                            🔒 Your connection is secure
                        </div>

                    </div>

                </section>

            </div>
        </>
    );
};

export default Login;