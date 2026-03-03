import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TodoCard from '../TodoCard';

describe('TodoCard Component', () => {
  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    dueDate: '2025-12-25',
    completed: 0,
    createdAt: '2025-11-01T00:00:00Z'
  };

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render todo title and due date', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText(/December 25, 2025/)).toBeInTheDocument();
  });

  it('should render unchecked checkbox when todo is incomplete', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should render checked checkbox when todo is complete', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should call onToggle when checkbox is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should show edit button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    expect(editButton).toBeInTheDocument();
  });

  it('should show delete button', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    expect(deleteButton).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked and confirmed', () => {
    window.confirm = jest.fn(() => true);
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const deleteButton = screen.getByLabelText(/Delete/);
    fireEvent.click(deleteButton);
    
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTodo.id);
  });

  it('should enter edit mode when edit button is clicked', () => {
    render(<TodoCard todo={mockTodo} {...mockHandlers} isLoading={false} />);
    
    const editButton = screen.getByLabelText(/Edit/);
    fireEvent.click(editButton);
    
    expect(screen.getByDisplayValue('Test Todo')).toBeInTheDocument();
  });

  it('should apply completed class when todo is completed', () => {
    const completedTodo = { ...mockTodo, completed: 1 };
    const { container } = render(<TodoCard todo={completedTodo} {...mockHandlers} isLoading={false} />);
    
    const card = container.querySelector('.todo-card');
    expect(card).toHaveClass('completed');
  });

  it('should not render due date when dueDate is null', () => {
    const todoNoDate = { ...mockTodo, dueDate: null };
    render(<TodoCard todo={todoNoDate} {...mockHandlers} isLoading={false} />);
    
    expect(screen.queryByText(/Due:/)).not.toBeInTheDocument();
  });
});

describe('TodoCard — overdue behaviour', () => {
  // Fix "today" to 2026-03-15 so all date comparisons are deterministic
  const TODAY = new Date('2026-03-15T00:00:00');
  const PAST_DATE = '2026-03-01';   // before today → overdue
  const TODAY_DATE = '2026-03-15';  // same day → NOT overdue
  const FUTURE_DATE = '2026-04-01'; // after today → NOT overdue

  const mockHandlers = {
    onToggle: jest.fn(),
    onEdit: jest.fn().mockResolvedValue(undefined),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(TODAY);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // FR-001: incomplete todo with a past due date → overdue class applied
  it('FR-001: applies overdue class for incomplete todo with past due date', () => {
    const todo = { id: 1, title: 'Overdue Task', dueDate: PAST_DATE, completed: 0 };
    const { container } = render(
      <TodoCard todo={todo} {...mockHandlers} isLoading={false} />
    );

    expect(container.querySelector('.todo-card')).toHaveClass('overdue');
  });

  // FR-001: overdue badge is visible for screen readers / sighted users
  it('FR-001: shows overdue badge for incomplete past-due todo', () => {
    const todo = { id: 1, title: 'Overdue Task', dueDate: PAST_DATE, completed: 0 };
    render(<TodoCard todo={todo} {...mockHandlers} isLoading={false} />);

    expect(screen.getByText('Overdue')).toBeInTheDocument();
  });

  // FR-001: due-date element gets overdue-date class
  it('FR-001: applies overdue-date class to the due-date element', () => {
    const todo = { id: 1, title: 'Overdue Task', dueDate: PAST_DATE, completed: 0 };
    const { container } = render(
      <TodoCard todo={todo} {...mockHandlers} isLoading={false} />
    );

    expect(container.querySelector('.todo-due-date')).toHaveClass('overdue-date');
  });

  // FR-003: todo due exactly today is NOT overdue
  it('FR-003: does not apply overdue class when due date is today', () => {
    const todo = { id: 2, title: 'Due Today', dueDate: TODAY_DATE, completed: 0 };
    const { container } = render(
      <TodoCard todo={todo} {...mockHandlers} isLoading={false} />
    );

    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  // FR-004: completed todo with a past due date is NOT overdue
  it('FR-004: does not apply overdue class when todo is completed', () => {
    const todo = { id: 3, title: 'Completed Old Task', dueDate: PAST_DATE, completed: 1 };
    const { container } = render(
      <TodoCard todo={todo} {...mockHandlers} isLoading={false} />
    );

    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  // FR-005: todo with no due date is NOT overdue
  it('FR-005: does not apply overdue class when dueDate is null', () => {
    const todo = { id: 4, title: 'No Date Task', dueDate: null, completed: 0 };
    const { container } = render(
      <TodoCard todo={todo} {...mockHandlers} isLoading={false} />
    );

    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  // FR-007: todo with a future due date is NOT overdue (simulates editing to future)
  it('FR-007: does not apply overdue class when due date is in the future', () => {
    const todo = { id: 5, title: 'Future Task', dueDate: FUTURE_DATE, completed: 0 };
    const { container } = render(
      <TodoCard todo={todo} {...mockHandlers} isLoading={false} />
    );

    expect(container.querySelector('.todo-card')).not.toHaveClass('overdue');
    expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
  });

  // FR-008: overdue todo still has functional edit button
  it('FR-008: overdue todo edit button is functional', () => {
    const todo = { id: 6, title: 'Overdue Task', dueDate: PAST_DATE, completed: 0 };
    render(<TodoCard todo={todo} {...mockHandlers} isLoading={false} />);

    fireEvent.click(screen.getByLabelText(/Edit/));
    expect(screen.getByDisplayValue('Overdue Task')).toBeInTheDocument();
  });

  // FR-008: overdue todo still has functional complete checkbox
  it('FR-008: overdue todo checkbox is functional', () => {
    const todo = { id: 7, title: 'Overdue Task', dueDate: PAST_DATE, completed: 0 };
    render(<TodoCard todo={todo} {...mockHandlers} isLoading={false} />);

    fireEvent.click(screen.getByRole('checkbox'));
    expect(mockHandlers.onToggle).toHaveBeenCalledWith(7);
  });

  // FR-008: overdue todo still has functional delete button
  it('FR-008: overdue todo delete button is functional', () => {
    window.confirm = jest.fn(() => true);
    const todo = { id: 8, title: 'Overdue Task', dueDate: PAST_DATE, completed: 0 };
    render(<TodoCard todo={todo} {...mockHandlers} isLoading={false} />);

    fireEvent.click(screen.getByLabelText(/Delete/));
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(8);
  });
});
