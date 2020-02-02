import adblockdetect from 'adblockdetect';
import React from 'react';

const AdblockDetect = ({ children }) => {
    const detected = adblockdetect.detected();

    return detected ? <>{children}</> : null;
};

export default AdblockDetect;
