import PropTypes from 'prop-types';
import React from 'react';
import { animated } from 'react-spring';

const PlayQueueInfoItem = ({ song, isFirst, style }) => (
    <animated.div className="row mb-2" style={style}>
        <div className="col">
            {isFirst && <small>Currently listening to<br/></small>}
            {song.title ?? '<unknown>'}
        </div>
    </animated.div>
);

PlayQueueInfoItem.propTypes = {
    song: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
    }).isRequired,
    isFirst: PropTypes.bool,
};

PlayQueueInfoItem.defaultProps = {
    isFirst: false,
};

export default PlayQueueInfoItem;
