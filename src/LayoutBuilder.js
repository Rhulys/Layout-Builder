import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import SortableElementList from './components/SortableElementList';

const LayoutContainer = styled.div`
	width: 100%;
	height: 500px;
	border: 1px solid #ccc;
	position: relative;
	user-select: none;
	display: ${(props) => (props.layoutType === 'flex' ? 'flex' : 'grid')};
	flex-direction: ${(props) =>
		props.layoutType === 'flex' && props.flexDirection
			? props.flexDirection
			: 'row'};
	justify-content: ${(props) =>
		props.layoutType == 'flex' && props.justifyContent
			? props.justifyContent
			: 'flex-start'};
	align-items: ${(props) =>
		props.layoutType === 'flex' && props.alignItems
			? props.alignItems
			: 'stretch'};
	grid-template-columns: ${(props) =>
		props.layoutType === 'grid' && props.gridTemplateColumns
			? props.gridTemplateColumns
			: 'auto'};
	grid-template-rows: ${(props) =>
		props.layoutType === 'grid' && props.gridTemplateRows
			? props.gridTemplateRows
			: 'auto'};
	gap: ${(props) =>
		props.layoutType === 'grid' && props.gap ? `${props.gap}px` : '0'};
`;

const DraggableElement = styled.div`
	position: ${(props) =>
		props.layoutType === 'absolute' ? 'absolute' : 'static'};
	background-color: #f0f0f0;
	border: 1px solid #bbb;
	padding: 10px;
	cursor: grab;
	width: ${(props) => `${props.width}px`}
	height: ${(props) => `${props.height}px`}
	display: 'flex';
	align-items: center;
	justify-content: space-between;
	padding-right: 25px
`;

const ResizeHandle = styled.div`
	position: absolute;
	width: 10px;
	height: 10px;
	background-color: #337ab7;
	border: 1px solid #2e6da4;
	cursor: nwse-resize;
`;

const CssOutput = styled.textarea`
	width: 100%;
	min-height: 150px;
	margin-top: 20px;
	font-family: monospace;
	font-size: 14px;
`;

const RemoveButton = styled.button`
	position: absolute;
	top: 5px;
	right: 5px;
	background: none;
	border: none;
	color: #ff0000;
	font-size: 14px;
	cursor: pointer;
	padding: 0;
	line-height: 1;
	width: 20px;
	height: 20px;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const ContentEditable = styled.div`
	flex-grow: 1;
	min-height: 30px;
	padding: 5px;
	outline: none;
	cursor: text;
`;

const ContentInput = styled.input`
	width: 100%;
	padding: 5px;
	margin: 0;
	border: 1px solid #ccc;
	box-sizing: border-box;
`;

function LayoutBuilder() {
	const [elements, setElements] = useState([]);
	const [elementCounter, setElementCounter] = useState(1);
	const [isDragging, setIsDragging] = useState(false);
	const [activeElement, setActiveElement] = useState(null);
	const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
	const [isResizing, setIsResizing] = useState(false);
	const [activeResizeElement, setActiveResizeElement] = useState(null);
	const [resizeDirection, setResizeDirection] = useState(null);
	const [resizeStart, setResizeStart] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	});
	const [layoutType, setLayoutType] = useState('absolute');
	const [flexDirection, setFlexDirection] = useState('row');
	const [justifyContent, setJustifyContent] = useState('flex-start');
	const [alignItems, setAlignItems] = useState('stretch');
	const [gridTemplateColumns, setGridTemplateColumns] = useState('1fr');
	const [gridTemplateRows, setGridTemplateRows] = useState('auto');
	const [gap, setGap] = useState('0');
	const [generatedCss, setGeneratedCss] = useState('');
	const [editingElementId, setEditingElementId] = useState(null);
	const [editText, setEditText] = useState('');

	const addElement = () => {
		setElements([
			...elements,
			{
				id: elementCounter,
				x: 10,
				y: 10,
				width: 100,
				height: 50,
				content: `Elemento ${elementCounter}`,
			},
		]);
		setElementCounter(elementCounter + 1);
	};

	const handleMouseDown = (event, elementId) => {
		const target = event.target;
		if (
			target.classList.contains('resize-handle') ||
			target.closest('button') ||
			target.tagName === 'INPUT'
		) {
			if (target.classList.contains('resize-handle')) {
				setIsResizing(true);
				setActiveResizeElement(elementId);
				setResizeDirection(target.dataset.direction);
				const element = elements.find((el) => el.id === elementId);
				if (element) {
					setResizeStart({
						x: event.clientX,
						y: event.clientY,
						width: element.width,
						height: element.height,
					});
				}
			}
		} else {
			setIsDragging(true);
			setActiveElement(elementId);
			setDragOffset({
				x: event.clientX - target.getBoundingClientRect().left,
				y: event.clientY - target.getBoundingClientRect().top,
			});
		}
	};

	const handleMouseMove = (event) => {
		if (isDragging && activeElement !== null) {
			const elementIndex = elements.findIndex(
				(el) => el.id === activeElement
			);

			if (elementIndex !== -1) {
				const newX = event.clientX - dragOffset.x;
				const newY = event.clientY - dragOffset.y;

				const newElements = [...elements];
				newElements[elementIndex] = {
					...newElements[elementIndex],
					x: newX,
					y: newY,
				};
				setElements(newElements);
			}
		} else if (
			isResizing &&
			activeResizeElement !== null &&
			resizeDirection
		) {
			const elementIndex = elements.findIndex(
				(el) => el.id === activeResizeElement
			);
			if (elementIndex !== -1) {
				const currentElement = elements[elementIndex];
				let newWidth = resizeStart.width;
				let newHeight = resizeStart.height;
				let newX = currentElement.x;
				let newY = currentElement.y;

				const deltaX = event.clientX - resizeStart.x;
				const deltaY = event.clientY - resizeStart.y;

				switch (resizeDirection) {
					case 'nw':
						newWidth = resizeStart.width - deltaX;
						newHeight = resizeStart.height - deltaY;
						newX = resizeStart.x + deltaX;
						newY = resizeStart.y + deltaY;
						break;
					case 'ne':
						newWidth = resizeStart.width + deltaX;
						newHeight = resizeStart.height - deltaY;
						newY = resizeStart.y + deltaY;
						break;
					case 'sw':
						newWidth = resizeStart.width - deltaX;
						newHeight = resizeStart.height + deltaY;
						newX = resizeStart.x + deltaX;
						break;
					case 'se':
						newWidth = resizeStart.width + deltaX;
						newHeight = resizeStart.height + deltaY;
						break;
					default:
						break;
				}

				const newElements = [...elements];
				newElements[elementIndex] = {
					...newElements[elementIndex],
					x: newX,
					y: newY,
					width: Math.max(10, newWidth),
					height: Math.max(10, newHeight),
				};
				setElements(newElements);
			}
		}
	};

	const handleMouseUp = () => {
		setIsDragging(false);
		setActiveElement(null);
		setIsResizing(false);
		setActiveResizeElement(null);
		setResizeDirection(null);
	};

	const handleLayoutChange = (event) => {
		setLayoutType(event.target.value);
		if (event.target.value !== 'flex') {
			setFlexDirection('row');
			setJustifyContent('flex-start');
			setAlignItems('stretch');
		}
		if (event.target.value !== 'grid') {
			setGridTemplateColumns('1fr');
			setGridTemplateRows('auto');
			setGap('0');
		}
	};

	const handleFlexDirectionChange = (event) => {
		setFlexDirection(event.target.value);
	};

	const handleJustifyContentChange = (event) => {
		setJustifyContent(event.target.value);
	};

	const handleAlignItemsChange = (event) => {
		setAlignItems(event.target.value);
	};

	const handleGridTemplateColumnsChange = (event) => {
		setGridTemplateColumns(event.target.value);
	};

	const handleGridTemplateRowsChange = (event) => {
		setGridTemplateRows(event.target.value);
	};

	const handleGapChange = (event) => {
		setGap(event.target.value);
	};

	const removeElement = (idToRemove) => {
		setElements(elements.filter((element) => element.id !== idToRemove));
		setEditingElementId(null);
	};

	const handleDoubleClick = (element) => {
		setEditingElementId(element.id);
		setEditText(element.content);
	};

	const handleInputChange = (event) => {
		setEditText(event.target.value);
	};

	const handleInputBlur = (elementId) => {
		const updatedElements = elements.map((el) =>
			el.id === elementId ? { ...el, content: editText } : el
		);
		setElements(updatedElements);
		setEditingElementId(null);
	};

	const handleInputKeyPress = (event, elementId) => {
		if (event.key === 'Enter') {
			handleInputBlur(elementId);
		}
	};

	const generateCss = () => {
		let css = `.layout-container {\n`;
		if (layoutType === 'flex') {
			css += ` display: flex;\n`;
			css += ` flex-direction: ${flexDirection};\n`;
			css += ` justify-content: ${justifyContent};\n`;
			css += ` align-items: ${alignItems};\n`;
		} else if (layoutType === 'grid') {
			css += ` display: grid;\n`;
			css += ` grid-template-columns: ${gridTemplateColumns};\n`;
			css += ` grid-template-rows: ${gridTemplateRows};\n`;
			css += ` gap: ${gap}px;\n`;
		} else {
			css += ` position: relative;\n`;
		}
		css += ` width: 100%;\n`;
		css += ` height: 500px;\n`;
		css += ` border: 1px solid #ccc;\n`;
		css += `}\n\n`;

		elements.forEach((element) => {
			css += `.element-${element.id} {\n`;
			if (layoutType === 'absolute') {
				css += ` position: absolute;\n`;
				css += ` left: ${element.x}px;\n`;
				css += ` top: ${element.y}px;\n`;
			}
			css += ` width: ${element.width}px;\n`;
			css += ` height: ${element.height}px;\n`;
			css += ` background-color: #f0f0f0;\n`;
			css += ` border: 1px solid #bbb;\n`;
			css += ` padding: 10px;\n`;
			css += `}\n\n`;
		});

		setGeneratedCss(css);
	};

	useEffect(() => {
		generateCss();
	}, [
		layoutType,
		flexDirection,
		justifyContent,
		alignItems,
		gridTemplateColumns,
		gridTemplateRows,
		gap,
		elements,
	]);

	React.useEffect(() => {
		document.addEventListener('mouseup', handleMouseUp);
		return () => {
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);

	return (
		<div>
			<h2>Construtor de Layout</h2>
			<div>
				<label>Tipo de Layout:</label>
				<select value={layoutType} onChange={handleLayoutChange}>
					<option value="absolute">Absolute</option>
					<option value="flex">Flexbox</option>
					<option value="grid">Grid</option>
				</select>
			</div>

			{layoutType === 'flex' && (
				<div>
					<div>
						<label>Direção do Flex:</label>
						<select
							value={flexDirection}
							onChange={handleFlexDirectionChange}
						>
							<option value="row">Linha (row)</option>
							<option value="column">Coluna (column)</option>
							<option value="row-reverse">
								Linha Invertida (row-reverse)
							</option>
							<option value="column-reverse">
								Coluna Invertida (column-reverse)
							</option>
						</select>
					</div>

					<div>
						<label>Alinhamento Horizontal:</label>
						<select
							value={justifyContent}
							onChange={handleJustifyContentChange}
						>
							<option value="flex-start">Início</option>
							<option value="flex-end">Fim</option>
							<option value="center">Centro</option>
							<option value="space-between">Espaço Entre</option>
							<option value="space-around">
								Espaço ao Redor
							</option>
							<option value="space-evenly">
								Espaço Uniforme
							</option>
						</select>
					</div>

					<div>
						<label>Alinhamento Vertical:</label>
						<select
							value={alignItems}
							onChange={handleAlignItemsChange}
						>
							<option value="stretch">Esticar</option>
							<option value="flex-start">Início</option>
							<option value="flex-end">Fim</option>
							<option value="center">Centro</option>
							<option value="baseline">Linha de Base</option>
						</select>
					</div>
				</div>
			)}

			{layoutType === 'grid' && (
				<div>
					<div>
						<label>Colunas da Grade:</label>
						<input
							type="text"
							value={gridTemplateColumns}
							onChange={handleGridTemplateColumnsChange}
							placeholder="Ex: 1fr 2fr auto"
						/>
					</div>
					<div>
						<label>Linhas da Grade:</label>
						<input
							type="text"
							value={gridTemplateRows}
							onChange={handleGridTemplateRowsChange}
							placeholder="Ex: auto 100px auto"
						/>
					</div>
					<div>
						<label>Espaçamento (Gap):</label>
						<input
							type="number"
							value={gap}
							onChange={handleGapChange}
							placeholder="Em pixels (ex: 10)"
						/>
					</div>
				</div>
			)}

			<button onClick={addElement}>Adicionar Elemento</button>

			<div style={{ display: 'flex', marginTop: '20px' }}>
				<LayoutContainer
					onMouseMove={handleMouseMove}
					layoutType={layoutType}
					flexDirection={flexDirection}
					justifyContent={justifyContent}
					alignItems={alignItems}
					gridTemplateColumns={gridTemplateColumns}
					gridTemplateRows={gridTemplateRows}
					gap={gap}
				>
					{elements.map((element) => (
						<DraggableElement
							key={element.id}
							layoutType={layoutType}
							width={element.width}
							height={element.height}
							style={{
								left: `${element.x}px`,
								top: `${element.y}px`,
							}}
							onMouseDown={(event) =>
								handleMouseDown(event, element.id)
							}
						>
							{editingElementId === element.id ? (
								<ContentInput
									type="text"
									value={editText}
									onChange={handleInputChange}
									onBlur={() => handleInputBlur(element.id)}
									onKeyPress={(event) =>
										handleInputKeyPress(event, element.id)
									}
									autoFocus
								/>
							) : (
								<ContentEditable
									onDoubleClick={() =>
										handleDoubleClick(element)
									}
								>
									{element.content}
								</ContentEditable>
							)}
							<RemoveButton
								onClick={() => removeElement(element.id)}
							>
								x
							</RemoveButton>
							<ResizeHandle
								className="resize-handle"
								data-direction="nw"
								style={{
									top: '-5px',
									left: '-5px',
									cursor: 'nwse-resize',
								}}
							/>
							<ResizeHandle
								className="resize-handle"
								data-direction="ne"
								style={{
									top: '-5px',
									right: '-5px',
									cursor: 'nesw-resize',
								}}
							/>
							<ResizeHandle
								className="resize-handle"
								data-direction="sw"
								style={{
									bottom: '-5px',
									left: '-5px',
									cursor: 'nesw-resize',
								}}
							/>
							<ResizeHandle
								className="resize-handle"
								data-direction="se"
								style={{
									bottom: '-5px',
									right: '-5px',
									cursor: 'nwse-resize',
								}}
							/>
						</DraggableElement>
					))}
				</LayoutContainer>

				<SortableElementList
					elements={elements}
					setElements={setElements}
					onRemoveElement={removeElement}
				/>
			</div>

			<h2>Código Css Gerado</h2>
			<CssOutput value={generatedCss} readOnly />
		</div>
	);
}

export default LayoutBuilder;
