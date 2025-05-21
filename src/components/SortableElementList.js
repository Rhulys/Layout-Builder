import React, { useState } from 'react';
import styled from 'styled-components';

const ListContainer = styled.div`
    width: 250px,
    border: 1px solid #ccc
    padding 10px;
    margin-left: 20px;
    background-color: f9f9f9;
    `;

const ListItem = styled.div`
	padding: 8px 10px;
	margin-bottom: 5px;
	background-color: #e0e0e0;
	border: 1px solid #d0d0d0;
	cursor: grab;
	display: flex;
	justify-content: space-between;
	align-items: center;

	&:last-child {
		margin-bottom: 0;
	}

	${(props) => props.isDragging && `opacity: 0.7; border: 2px dashed #007bff`}
`;

const RemoveButton = styled.button`
	background: none;
	border: none;
	color: #ff0000;
	font-size: 12px;
	cursor: pointer;
	padding: 0 5px;
`;
function SortableElementList({ elements, setElements, onRemoveElement }) {
	const [draggingItem, setDraggingItem] = useState(null);
	const [dragOverItem, setDragOverItem] = useState(null);

	const handleDragStart = (e, index) => {
		setDraggingItem(elements[index]);
		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/plain', index.toString());
	};

	const handlerDragEnter = (e, index) => {
		if (draggingItem && draggingItem.id !== elements[index].id) {
			setDragOverItem(elements[index]);
		}
	};

	const handleDragEnd = () => {
		setDraggingItem(null);
		setDragOverItem(null);
	};

	const handleDrop = (e, dropIndex) => {
		e.preventDefault();
		if (!draggingItem) return;

		const draggingIndex = elements.findIndex(
			(el) => el.id === draggingItem.id
		);
		if (draggingIndex === -1) return;

		const newElements = Array.from(elements);
		const [removed] = newElements.splice(draggingIndex, 1);
		newElements.splice(dropIndex, 0, removed);

		setElements(newElements);
		setDraggingItem(null);
		setDragOverItem(null);
	};

	const handleDragOver = (e) => {
		e.preventDefault();
	};

	return (
		<ListContainer>
			<h3>Ordem dos Elementos</h3>
			{elements.map((element, index) => (
				<ListItem
					key={element.id}
					draggable
					onDragStart={(e) => handleDragStart(e, index)}
					onDragEnter={(e) => handlerDragEnter(e, index)}
					onDrop={(e) => handleDrop(e, index)}
					onDragOver={handleDragOver}
					isDragging={draggingItem && draggingItem.id === element.id}
				>
					<span>{element.content}</span>
					<RemoveButton onClick={() => onRemoveElement(element.id)}>
						x
					</RemoveButton>
				</ListItem>
			))}
		</ListContainer>
	);
}

export default SortableElementList;
