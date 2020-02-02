import React from 'react';
import { useNightMode } from '../hooks/night-mode';

const Button = props => {
    const nightMode = useNightMode();
    return <input type="button" className={`btn btn-outline-${nightMode ? 'light' : 'dark'}`} {...props} />;
};

export default Button;