import PropTypes from 'prop-types';
import React from 'react';

const LoadingSpinner = ({ resource }) => (
    <div className="container-fluid">
        <div className="row justify-content-center">
            <div className="title loading col-12">
                {resource ? `Loading ${resource}...` : 'Loading...'}
            </div>
            <div className="col-12 d-flex justify-content-center">
                <div className="loader" />
            </div>
        </div>
    </div>
);

LoadingSpinner.propTypes = {
    resource: PropTypes.string,
};

LoadingSpinner.defaultProps = {
    resource: null,
};

export default LoadingSpinner;
