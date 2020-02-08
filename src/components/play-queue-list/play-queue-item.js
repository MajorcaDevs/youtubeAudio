import PropTypes from 'prop-types';
import React from 'react';
import PlayQueueInfoItem from './play-queue-info-item';
import PlayQueueDraggableItem from './play-queue-draggable-item';

const PlayQueueItem = ({ song, index, onRemove, edit, style }) => !edit || index === 0 ? (
    <PlayQueueInfoItem song={song} isFirst={index === 0} style={style} />
) : (
    <PlayQueueDraggableItem
        song={song}
        index={index}
        onRemove={onRemove}
    />
);

PlayQueueItem.propTypes = {
    song: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    edit: PropTypes.bool,
    styles: PropTypes.object,
};

PlayQueueItem.defaultProps = {
    edit: false,
    styles: undefined,
};

export default PlayQueueItem;
