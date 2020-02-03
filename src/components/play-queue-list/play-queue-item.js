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
        style={style}
    />
);

PlayQueueItem.propTypes = {
    song: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired,
    edit: PropTypes.bool.isRequired,
    styles: PropTypes.object,
};

export default PlayQueueItem;
