import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import Login, { LOGIN_MUTATION } from "../pages/Login";


const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const successMocks = [
  {
    request: {
      query: LOGIN_MUTATION,
      variables: { email: "test@example.com", password: "password" },
    },
    result: {
      data: {
        loginUser: {
          token: "mock_token",
          user: { id: "1", full_name: "Test User", role: "user" },
        },
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: LOGIN_MUTATION,
      variables: { email: "wrong@example.com", password: "wrongpass" },
    },
    error: new Error("Invalid credentials"),
  },
];

describe("Login Page", () => {

  test("logs in user successfully and navigates to /ngos", async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));


    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/ngos");
    });
  });

  test("shows error message on failed login", async () => {
    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpass" },
    });

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });
});
