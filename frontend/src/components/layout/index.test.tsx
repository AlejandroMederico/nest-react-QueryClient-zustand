import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import Layout from './index';

// Mocks
jest.mock('./Sidebar', () => ({
  __esModule: true,
  default: (props: any) => <aside data-testid="sidebar" {...props} />,
}));
jest.mock('./Footer', () => ({
  __esModule: true,
  default: () => <footer data-testid="footer" />,
}));

const Header = () => <div>Header</div>;
const Body = () => <div>Body</div>;

describe('Layout', () => {
  it('renders header, body, sidebar, and footer', () => {
    render(
      <Layout>
        <Header />,
        <Body />,
      </Layout>,
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('toggles sidebar on button click', () => {
    render(
      <Layout>
        <Header />,
        <Body />,
      </Layout>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Open sidebar');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Close sidebar');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-label', 'Open sidebar');
  });
});
