import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {loginUser, signupUser} from '../store/actions/auth.js';
import Image from 'next/image';
import logo from '../assets/images/logo.png';
import facebook from '../assets/images/facebook.png';
import google from '../assets/images/google.png';
import linkedin from '../assets/images/linkedin.png';
import styles from '@/styles/login.module.scss';
import { AppDispatch } from '@/pages/_app';
import Loading from '@/components/ui/loading';
function Login() {
    const dispatch = useDispatch<AppDispatch>()
    const [login, signup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleLogin = async (): Promise<void> => {
        setLoading(true);
        await dispatch(loginUser(email, password));
        setLoading(false);
    };

    const handleSignup = async (): Promise<void> => {
        if (passwordsMatch(password, confirmPassword)) {
            setLoading(true);
            await dispatch(signupUser(email, password));
            setLoading(false)
        } else {
            console.log("Passwords do not match!");
        }
        
    };
    
    function passwordsMatch(password: String, confirmPassword: String) {
        return password === confirmPassword;
    }

    if(loading) return (<Loading />)
    return (
        <div className={styles.login}>
            <div className={`${styles['login__colored-container']} ${login ? styles['login__colored-container--left'] : styles['login__colored-container--right']}`}></div>
            <div className={`${styles['login__welcome-back']} ${login ? styles['login__welcome-back--active'] : styles['login__welcome-back--inactive']}`}>
                <div className={styles['login__welcome-back__logo-container']}>
                    <Image className={styles['login__welcome-back__logo-container--image']} src={logo} alt="Budwriter" />
                    EnlightenGPT
                </div>
                <div className={styles['login__welcome-back__main-container']}>
                    <div className={styles['login__welcome-back__main-container__text-container']}>
                        <span className={styles['login__welcome-back__main-container__text-container--title']}>
                            Welcome Back!
                        </span>
                        <span className={styles['login__welcome-back__main-container__text-container--secondary']}>
                            To keep sharing your work with us, please log in.
                        </span>
                    </div>
                    <div onClick={() => {
                        signup(!login)
                    }} className={styles['login__welcome-back__main-container__button-container']}>
                        Sign In
                    </div>
                </div>
            </div>
            <div className={`${styles['login__create-container']} ${login ? styles['login__create-container--active'] : styles['login__create-container--inactive']}`}>
                Create Account
                <div className={styles['login__create-container__social-container']}>
                    <Image className={styles['login__create-container__social-container--facebook-icon']} src={facebook} alt="" />
                    <Image className={styles['login__create-container__social-container--google-icon']} src={google} alt="" />
                    <Image className={styles['login__create-container__social-container--linkedin-icon']} src={linkedin} alt="" />
                </div>
                <span className={styles['login__create-container--info-text']}>or use email for your registration</span>
                <div className={styles['login__create-container__form-container']}>
                    <form className={styles['login__create-container__form-container__form']} onSubmit={(e) => {
                        e.preventDefault();
                        handleSignup()
                    }}>
                        <input
                            className={styles['login__create-container__form-container__form--email']}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required />
                        <input
                            className={styles['login__create-container__form-container__form--password']}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required />
                        <input
                            className={styles['login__create-container__form-container__form--password']}
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required />
                        <button
                            className={styles['login__create-container__form-container__form--submit']}>
                            Sign Up
                        </button>
                    </form>
                </div>
            </div>
            <div className={`${styles['login__login-container']} ${!login ? styles['login__login-container--active'] : styles['login__login-container--inactive']}`}>
                <div className={styles['login__login-container__logo-container']}>
                    <Image className={styles['login__login-container__logo-container--image']} src={logo} alt="Budwriter" />
                    EnlightenGPT
                </div>
                <div className={styles['login__login-container__main-container']}>
                    <div className={styles['login__login-container__main-container__social-container']}>
                        <Image className={styles['login__login-container__main-container__social-container--facebook-icon']} src={facebook} alt="" />
                        <Image className={styles['login__login-container__main-container__social-container--google-icon']} src={google} alt="" />
                        <Image className={styles['login__login-container__main-container__social-container--linkedin-icon']} src={linkedin} alt="" />
                    </div>
                    <span className={styles['login__login-container__main-container--info-text']}>or use email for your login</span>
                    <div className={styles['login__login-container__main-container__form-container']}>
                        <form className={styles['login__login-container__main-container__form-container__form']} onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin()
                        }}>
                            <input
                                className={styles['login__login-container__main-container__form-container__form--email']}
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required />
                            <input
                                className={styles['login__login-container__main-container__form-container__form--password']}
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                            <button
                                className={styles['login__login-container__main-container__form-container__form--submit']}>
                                Log In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div className={`${styles['login__hello-container']} ${!login ? styles['login__hello-container--active'] : styles['login__hello-container--inactive']}`}>
                <div className={styles['login__welcome-back__main-container__text-container']}>
                    <span className={styles['login__welcome-back__main-container__text-container--title']}>
                        Hello, stranger!
                    </span>
                    <span className={styles['login__welcome-back__main-container__text-container--secondary']}>
                        Enter your personal details and start your own portfolio!
                    </span>
                </div>
                <div onClick={() => {
                    signup(!login)
                }} className={styles['login__welcome-back__main-container__button-container']}>
                    Sign Up
                </div>
            </div>
        </div>
    );
}

export default Login;
