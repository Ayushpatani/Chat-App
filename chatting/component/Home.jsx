import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [credentials, setCredentials] = useState({
        name: "",
        email: "",
        password: "",
        cpassword: "",
    });

    const [pic, setPic] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, password, cpassword } = credentials;

        if (password !== cpassword) {
            alert("Passwords do not match");
            return;
        }

        const formData = new FormData();

        formData.append("name", name);
        formData.append("email", email);
        formData.append("password", password);

        if (pic) {
            formData.append("pic", pic);
        }

        try {
            const response = await fetch(
                "http://localhost:8000/api/auth/createuser",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const json = await response.json();

            console.log(json);

            if (json.success) {
                localStorage.setItem("token", json.authtoken);
                navigate("/chat");
            } else {
                alert(json.error || "Invalid details");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Something went wrong");
        }
    };

    const onChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        setPic(e.target.files[0]);
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
                    background: #08090d;
                }

                /* ========================================
                   MAIN PAGE
                ======================================== */

                .signup-page {
                    min-height: 100vh;
                    display: flex;
                    background: #08090d;
                    color: white;
                    overflow: hidden;
                }

                /* ========================================
                   LEFT SECTION
                ======================================== */

                .signup-left {
                    width: 52%;
                    min-height: 100vh;

                    position: relative;
                    overflow: hidden;

                    display: flex;
                    align-items: center;

                    padding: 70px;

                    background:
                        radial-gradient(
                            circle at 15% 20%,
                            rgba(99, 102, 241, 0.35),
                            transparent 35%
                        ),
                        radial-gradient(
                            circle at 85% 80%,
                            rgba(168, 85, 247, 0.25),
                            transparent 35%
                        ),
                        #08090d;
                }

                .signup-left-content {
                    max-width: 620px;
                    position: relative;
                    z-index: 2;
                }

                /* ========================================
                   BRAND
                ======================================== */

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

                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #a855f7
                        );

                    box-shadow:
                        0 10px 35px
                        rgba(99, 102, 241, 0.35);
                }

                .brand-name {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.5px;
                }

                /* ========================================
                   HERO
                ======================================== */

                .hero-title {
                    font-size: clamp(48px, 5vw, 76px);

                    line-height: 1.02;

                    letter-spacing: -4px;

                    font-weight: 800;

                    margin: 0 0 28px;
                }

                .hero-title span {
                    background:
                        linear-gradient(
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

                /* ========================================
                   FEATURES
                ======================================== */

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

                    box-shadow:
                        0 0 15px #818cf8;
                }

                /* ========================================
                   DECORATIVE ORBS
                ======================================== */

                .orb {
                    position: absolute;
                    border-radius: 50%;

                    pointer-events: none;
                }

                .orb-one {
                    width: 300px;
                    height: 300px;

                    right: -100px;
                    top: -100px;

                    background:
                        rgba(99, 102, 241, 0.08);

                    border:
                        1px solid
                        rgba(129, 140, 248, 0.15);
                }

                .orb-two {
                    width: 450px;
                    height: 450px;

                    left: -250px;
                    bottom: -250px;

                    background:
                        rgba(168, 85, 247, 0.06);

                    border:
                        1px solid
                        rgba(168, 85, 247, 0.12);
                }

                /* ========================================
                   RIGHT SECTION
                ======================================== */

                .signup-right {
                    width: 48%;
                    min-height: 100vh;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    padding: 40px;

                    background: #101116;

                    border-left:
                        1px solid
                        rgba(255, 255, 255, 0.06);
                }

                .signup-box {
                    width: 100%;
                    max-width: 560px;
                }

                /* ========================================
                   HEADING
                ======================================== */

                .signup-heading {
                    margin-bottom: 32px;
                }

                .signup-heading h1 {
                    font-size: 34px;

                    letter-spacing: -1.5px;

                    margin: 0 0 10px;

                    font-weight: 750;
                }

                .signup-heading p {
                    margin: 0;

                    color: #71717a;

                    font-size: 15px;
                }

                /* ========================================
                   FORM ROW
                ======================================== */

                .input-group {
                    display: grid;

                    grid-template-columns: 130px 1fr;

                    align-items: center;

                    gap: 16px;

                    margin-bottom: 18px;
                }

                .input-group label {
                    color: #d4d4d8;

                    font-size: 13px;

                    font-weight: 600;

                    margin: 0;

                    white-space: nowrap;
                }

                /* ========================================
                   INPUT WRAPPER
                ======================================== */

                .input-wrapper {
                    position: relative;

                    width: 100%;
                }

                .input-icon {
                    position: absolute;

                    left: 17px;
                    top: 50%;

                    transform:
                        translateY(-50%);

                    color: #71717a;

                    font-size: 14px;

                    z-index: 1;
                }

                /* ========================================
                   INPUT
                ======================================== */

                .modern-input {
                    width: 100%;

                    height: 52px;

                    border-radius: 12px;

                    border:
                        1px solid #27272a;

                    background: #18191f;

                    color: white;

                    padding:
                        0 16px 0 46px;

                    outline: none;

                    font-size: 14px;

                    transition:
                        all 0.2s ease;
                }

                .modern-input::placeholder {
                    color: #52525b;
                }

                .modern-input:focus {
                    border-color: #6366f1;

                    background: #1b1c23;

                    box-shadow:
                        0 0 0 3px
                        rgba(99, 102, 241, 0.12);
                }

                /* ========================================
                   PROFILE PICTURE
                ======================================== */

                .profile-upload {
                    display: grid;

                    grid-template-columns: 130px 1fr;

                    align-items: center;

                    gap: 16px;

                    margin-top: 5px;

                    margin-bottom: 22px;
                }

                .profile-label {
                    color: #d4d4d8;

                    font-size: 13px;

                    font-weight: 600;

                    margin: 0;

                    white-space: nowrap;
                }

                .file-box {
                    width: 100%;

                    height: 52px;

                    border:
                        1px dashed #3f3f46;

                    border-radius: 12px;

                    background: #18191f;

                    display: flex;

                    align-items: center;

                    padding: 8px 12px;

                    transition:
                        border-color 0.2s ease;
                }

                .file-box:hover {
                    border-color: #6366f1;
                }

                .file-box input {
                    width: 100%;

                    color: #a1a1aa;

                    font-size: 13px;
                }

                .file-box input::file-selector-button {
                    border: none;

                    background: #27272a;

                    color: #d4d4d8;

                    padding: 8px 12px;

                    border-radius: 8px;

                    margin-right: 10px;

                    cursor: pointer;
                }

                .file-box input::file-selector-button:hover {
                    background: #3f3f46;
                }

                /* ========================================
                   SIGNUP BUTTON
                ======================================== */

                .signup-button {
                    width: 100%;

                    height: 54px;

                    border: none;

                    border-radius: 12px;

                    background:
                        linear-gradient(
                            135deg,
                            #6366f1,
                            #8b5cf6
                        );

                    color: white;

                    font-size: 15px;

                    font-weight: 700;

                    cursor: pointer;

                    transition:
                        all 0.25s ease;

                    box-shadow:
                        0 12px 30px
                        rgba(99, 102, 241, 0.2);
                }

                .signup-button:hover {
                    transform:
                        translateY(-2px);

                    box-shadow:
                        0 18px 40px
                        rgba(99, 102, 241, 0.3);
                }

                .signup-button:active {
                    transform:
                        translateY(0);
                }

                /* ========================================
                   LOGIN LINK
                ======================================== */

                .login-link {
                    text-align: center;

                    margin-top: 25px;

                    color: #71717a;

                    font-size: 14px;
                }

                .login-link span {
                    color: #a5b4fc;

                    font-weight: 600;

                    cursor: pointer;

                    margin-left: 4px;
                }

                .login-link span:hover {
                    color: #c4b5fd;
                }

                /* ========================================
                   SECURITY
                ======================================== */

                .security {
                    margin-top: 30px;

                    display: flex;

                    justify-content: center;

                    align-items: center;

                    gap: 7px;

                    color: #52525b;

                    font-size: 12px;
                }

                /* ========================================
                   TABLET
                ======================================== */

                @media (max-width: 1100px) {

                    .signup-left {
                        padding: 50px;
                    }

                    .signup-right {
                        padding: 30px;
                    }

                    .signup-box {
                        max-width: 520px;
                    }
                }

                /* ========================================
                   MOBILE
                ======================================== */

                @media (max-width: 900px) {

                    .signup-page {
                        display: block;
                    }

                    .signup-left {
                        width: 100%;

                        min-height: auto;

                        padding: 40px 30px;
                    }

                    .signup-left-content {
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

                    .signup-right {
                        width: 100%;

                        min-height: auto;

                        border-left: none;

                        border-top:
                            1px solid
                            rgba(255, 255, 255, 0.06);

                        padding: 55px 30px;
                    }
                }

                /* ========================================
                   SMALL MOBILE
                ======================================== */

                @media (max-width: 600px) {

                    .signup-left {
                        padding: 30px 22px;
                    }

                    .brand {
                        margin-bottom: 45px;
                    }

                    .hero-title {
                        font-size: 42px;

                        letter-spacing: -2px;
                    }

                    .features {
                        gap: 15px;
                    }

                    .signup-right {
                        padding: 45px 22px;
                    }

                    .signup-heading h1 {
                        font-size: 29px;
                    }

                    /* Stack label + input on small screens */

                    .input-group {
                        grid-template-columns: 1fr;

                        gap: 7px;

                        margin-bottom: 18px;
                    }

                    .input-group label {
                        margin-bottom: 0;
                    }

                    .profile-upload {
                        grid-template-columns: 1fr;

                        gap: 7px;
                    }
                }
            `}</style>

            <div className="signup-page">

                {/* ========================================
                    LEFT SIDE
                ======================================== */}

                <section className="signup-left">

                    <div className="orb orb-one"></div>
                    <div className="orb orb-two"></div>

                    <div className="signup-left-content">

                        <div className="brand">

                            <div className="brand-icon">
                                C
                            </div>

                            <div className="brand-name">
                                Chatting
                            </div>

                        </div>

                        <h2 className="hero-title">
                            Start a
                            <br />
                            <span>conversation.</span>
                        </h2>

                        <p className="hero-description">
                            Create your account and start connecting
                            with people through fast, simple and
                            real-time conversations.
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
                                Share images & files
                            </div>

                        </div>

                    </div>

                </section>

                {/* ========================================
                    RIGHT SIDE
                ======================================== */}

                <section className="signup-right">

                    <div className="signup-box">

                        <div className="signup-heading">

                            <h1>
                                Create your account
                            </h1>

                            <p>
                                Join Chatting and start connecting.
                            </p>

                        </div>

                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                        >

                            {/* NAME */}

                            <div className="input-group">

                                <label htmlFor="name">
                                    Full name
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        ●
                                    </span>

                                    <input
                                        className="modern-input"
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Enter your name"
                                        value={credentials.name}
                                        onChange={onChange}
                                        required
                                    />

                                </div>

                            </div>

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
                                        name="email"
                                        id="email"
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
                                        name="password"
                                        id="password"
                                        placeholder="Create a password"
                                        value={credentials.password}
                                        onChange={onChange}
                                        minLength={6}
                                        required
                                    />

                                </div>

                            </div>

                            {/* CONFIRM PASSWORD */}

                            <div className="input-group">

                                <label htmlFor="cpassword">
                                    Confirm password
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        ●
                                    </span>

                                    <input
                                        className="modern-input"
                                        type="password"
                                        name="cpassword"
                                        id="cpassword"
                                        placeholder="Confirm your password"
                                        value={credentials.cpassword}
                                        onChange={onChange}
                                        minLength={6}
                                        required
                                    />

                                </div>

                            </div>

                            {/* PROFILE PICTURE */}

                            <div className="profile-upload">

                                <label
                                    htmlFor="pic"
                                    className="profile-label"
                                >
                                    Profile picture
                                </label>

                                <div className="file-box">

                                    <input
                                        type="file"
                                        name="pic"
                                        id="pic"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />

                                </div>

                            </div>

                            {/* SUBMIT */}

                            <button
                                type="submit"
                                className="signup-button"
                            >
                                Create account
                            </button>

                        </form>

                        {/* LOGIN */}

                        <div className="login-link">

                            Already have an account?

                            <span
                                onClick={() => navigate("/login")}
                            >
                                Sign in
                            </span>

                        </div>

                        {/* SECURITY */}

                        <div className="security">
                            🔒 Your information is secure
                        </div>

                    </div>

                </section>

            </div>
        </>
    );
};

export default Home;