import React from 'react';
import github from '../github.svg';

const Footer = () => (
    <footer className="AppFooter footer align-items-center" id="AppFooter">
        <div id="FooterContent">
            <a href="https://github.com/MajorcaDevs/youtubeAudio" target="_blank" rel="noopener noreferrer">
                <img alt="GitHub" src={github} id="githubLogo" className="mr-1" />
                &nbsp;Made by <b>MajorcaDevs</b> with <b>{'<3'}</b>
            </a>
        </div>
    </footer>
);

export default Footer;
