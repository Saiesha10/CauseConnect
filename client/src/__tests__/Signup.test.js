import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import Signup, { SIGNUP_MUTATION } from "../pages/Signup";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        profile_picture: "",
        role: "user",
        phone: "",
        description: "",
      },
    },
    result: {
      data: {
        signUpUser: {
          token: "mockToken",
          user: {
            id: "1",
            full_name: "Jane Doe",
            role: "user",
            __typename: "User",
          },
          __typename: "SignUpResponse",
        },
      },
    },
  },
];

const errorMocks = [
  {
    request: {
      query: SIGNUP_MUTATION,
      variables: {
        full_name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        profile_picture: "",
        role: "organizer",
        phone: "",
        description: "",
      },
    },
    error: new Error("User already exists"),
  },
];

describe("Signup Page", () => {
  test("signs up user successfully and navigates to /login", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      </MockedProvider>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    await userEvent.click(screen.getByLabelText(/role/i));
    await userEvent.click(screen.getByText(/user/i));

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/ngos");
    });
  });

  test("shows error message when signup fails", async () => {
    render(
      <MockedProvider mocks={errorMocks}>
        <MemoryRouter>
          <Signup />
        </MemoryRouter>
      </MockedProvider>
    );

    await userEvent.type(screen.getByLabelText(/full name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");

    await userEvent.click(screen.getByLabelText(/role/i));
    await userEvent.click(screen.getByText(/organizer/i));

    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => {
      expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
    });
  });
});
