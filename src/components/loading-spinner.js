import PropTypes from 'prop-types';
import React from 'react';

const LoadingSpinner = ({ resource }) => (
    <div className="row justify-content-center">
        <div className="title loading" id="stateText">
            {resource ? `Loading ${resource}...` : 'Loading...'}
        </div>
        <div className="loader"/>
    </div>
);

LoadingSpinner.propTypes = {
    resource: PropTypes.string,
};

LoadingSpinner.defaultProps = {
    resource: null,
};

export default LoadingSpinner;
