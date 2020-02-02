import PropTypes from 'prop-types';
import React from 'react';

const Pagination = ({ page, totalPages, prevPage, nextPage }) => (
    <div className="btn-group search-panel-pagination my-2" role="group" aria-label="Pagination">
        <button type="button" className="btn btn-secondary btn-sm" disabled={page === 0} onClick={prevPage}>
            <i className="material-icons">chevron_left</i>
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled>
            {page + 1}
        </button>
        <button type="button" className="btn btn-secondary btn-sm" disabled={page === totalPages - 1} onClick={nextPage}>
            <i className="material-icons">chevron_right</i>
        </button>
    </div>
);

Pagination.propTypes = {
    page: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    prevPage: PropTypes.func.isRequired,
    nextPage: PropTypes.func.isRequired,
};

export default Pagination;
