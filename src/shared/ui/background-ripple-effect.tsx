'use client';

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/shared/lib";

interface BackgroundRippleEffectProps {
  rows?: number;
  cols?: number;
  cellSize?: number;
  children?: React.ReactNode;
  className?: string;
}

interface DivGridProps {
  rows: number;
  cols: number;
  cellSize: number;
  borderColor: string;
  fillColor: string;
  clickedCell: { row: number; col: number } | null;
  onCellClick?: (row: number, col: number) => void;
  interactive?: boolean;
  className?: string;
}

const DivGrid: React.FC<DivGridProps> = ({
  rows,
  cols,
  cellSize,
  borderColor,
  fillColor,
  clickedCell,
  onCellClick,
  interactive = false,
  className,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const gridStyle = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      gap: "1px",
    }),
    [cols, rows, cellSize]
  );

  const cellStyle = useCallback(
    (row: number, col: number) => {
      const isClicked =
        clickedCell && clickedCell.row === row && clickedCell.col === col;
      const isHovered =
        hoveredCell && hoveredCell.row === row && hoveredCell.col === col;

      return {
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        border: `1px solid ${borderColor}`,
        backgroundColor: fillColor,
        opacity: isClicked || isHovered ? 0.8 : 0.4,
        transition: "opacity 200ms ease-out",
        animation: isClicked ? "cell-ripple 200ms ease-out forwards" : "none",
      };
    },
    [cellSize, borderColor, fillColor, clickedCell, hoveredCell]
  );

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (interactive && onCellClick) {
        onCellClick(row, col);
      }
    },
    [interactive, onCellClick]
  );

  const handleCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (interactive) {
        setHoveredCell({ row, col });
      }
    },
    [interactive]
  );

  const handleCellMouseLeave = useCallback(() => {
    if (interactive) {
      setHoveredCell(null);
    }
  }, [interactive]);

  const cells = useMemo(() => {
    const cellsArray = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        cellsArray.push(
          <div
            key={`${row}-${col}`}
            style={cellStyle(row, col)}
            onClick={() => handleCellClick(row, col)}
            onMouseEnter={() => handleCellMouseEnter(row, col)}
            onMouseLeave={handleCellMouseLeave}
            className={interactive ? "cursor-pointer" : ""}
          />
        );
      }
    }
    return cellsArray;
  }, [
    rows,
    cols,
    cellStyle,
    handleCellClick,
    handleCellMouseEnter,
    handleCellMouseLeave,
    interactive,
  ]);

  return (
    <div style={gridStyle} className={className}>
      {cells}
    </div>
  );
};

export const BackgroundRippleEffect: React.FC<
  BackgroundRippleEffectProps
> = ({ rows = 8, cols = 27, cellSize = 56, children, className }) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number;
    col: number;
  } | null>(null);

  const handleCellClick = useCallback((row: number, col: number) => {
    setClickedCell({ row, col });
    setTimeout(() => setClickedCell(null), 200);
  }, []);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div className="absolute inset-0 flex items-center justify-center">
        <DivGrid
          rows={rows}
          cols={cols}
          cellSize={cellSize}
          borderColor="rgba(255, 255, 255, 0.1)"
          fillColor="rgba(255, 255, 255, 0.05)"
          clickedCell={clickedCell}
          onCellClick={handleCellClick}
          interactive={true}
          className="opacity-50"
        />
      </div>
      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  );
};

