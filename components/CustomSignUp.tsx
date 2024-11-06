'use client';

import React, { useState } from 'react';
import { Auth } from 'aws-amplify/auth';

function CustomSignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignUp = async () => {
        try {
            const { user } = await Auth.signUp({
                email,
                password,
            });
            console.log('User Signed up successfully: ', user);
        } catch (error) {
            console.error('Error during sign up', error);
        }
    };

    return (
        <div>
            <input type='email' placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type='password' placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleSignUp}>Sign Up</button>
        </div>
    );
}

export default CustomSignUp;