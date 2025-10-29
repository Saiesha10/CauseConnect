jest.mock("../apolloClient", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
  },
}));

jest.mock("../utils/cloudinary", () => ({
  uploadToCloudinary: jest.fn(() =>
    Promise.resolve("https://mock.cloudinary.com/profile.jpg")
  ),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ProfileSection, { GET_USER, UPDATE_USER } from "../components/ProfileSection";

// ----- Mock user data -----
const mockUser = {
  id: "1",
  full_name: "John Doe",
  profile_picture: "https://example.com/john.jpg",
  email: "john@example.com",
  phone: "+911234567890",
  description: "Test user profile",
  role: "Volunteer",
  created_at: "2025-10-29",
};

// ----- Apollo mocks -----
const userQueryMock = {
  request: {
    query: GET_USER,
    variables: { id: "1" },
  },
  result: {
    data: { user: mockUser },
  },
};

const userQueryErrorMock = {
  request: {
    query: GET_USER,
    variables: { id: "1" },
  },
  error: new Error("Failed to fetch user"),
};

const updateUserMock = {
  request: {
    query: UPDATE_USER,
    variables: {
      id: "1",
      full_name: "John Doe Updated",
      profile_picture: mockUser.profile_picture,
      email: mockUser.email,
      phone: mockUser.phone,
      description: mockUser.description,
    },
  },
  result: {
    data: {
      updateUser: {
        id: "1",
        full_name: "John Doe Updated",
        profile_picture: mockUser.profile_picture,
        email: mockUser.email,
        phone: mockUser.phone,
        description: mockUser.description,
      },
    },
  },
};

const updateUserErrorMock = {
  request: {
    query: UPDATE_USER,
    variables: {
      id: "1",
      full_name: "John Doe Updated",
      profile_picture: mockUser.profile_picture,
      email: mockUser.email,
      phone: mockUser.phone,
      description: mockUser.description,
    },
  },
  error: new Error("Failed to update user"),
};

// ----- Helper render -----
const renderProfile = (mocks) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <ProfileSection userId="1" />
      </MemoryRouter>
    </MockedProvider>
  );
};

// ----- Test Suite -----
describe("👤 ProfileSection Component", () => {
  test("renders loading state initially", () => {
    renderProfile([]);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders user data after successful query", async () => {
    renderProfile([userQueryMock]);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Full Name")).toHaveValue("John Doe");
    expect(screen.getByLabelText("Email")).toHaveValue("john@example.com");
  });

  test("updates user profile successfully", async () => {
    renderProfile([userQueryMock, updateUserMock]);

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );

    const nameInput = screen.getByLabelText("Full Name");
    fireEvent.change(nameInput, { target: { value: "John Doe Updated" } });

    const updateBtn = screen.getByRole("button", { name: /update profile/i });
    fireEvent.click(updateBtn);

    await waitFor(() =>
      expect(
        screen.getByText(/profile updated successfully!/i)
      ).toBeInTheDocument()
    );
  });

  test("shows error when update fails", async () => {
    renderProfile([userQueryMock, updateUserErrorMock]);

    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );

    const nameInput = screen.getByLabelText("Full Name");
    fireEvent.change(nameInput, { target: { value: "John Doe Updated" } });

    const updateBtn = screen.getByRole("button", { name: /update profile/i });
    fireEvent.click(updateBtn);

    await waitFor(() =>
      expect(screen.getByText(/failed to update user/i)).toBeInTheDocument()
    );
  });

  test("renders error state when GET_USER fails", async () => {
    renderProfile([userQueryErrorMock]);
    await waitFor(() =>
      expect(screen.getByText(/failed to fetch user/i)).toBeInTheDocument()
    );
  });
});
