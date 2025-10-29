jest.mock("../apolloClient", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
  },
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import NGO_Details, {
  GET_NGO,
  GET_USER_FAVORITES,
  ADD_FAVORITE,
  REMOVE_FAVORITE,
} from "../pages/NGO_Details";

// ----- Mock Data -----
const ngoMockData = {
  id: "1",
  name: "Helping Hands",
  cause: "Education",
  description: "We help underprivileged children access quality education.",
  location: "Bangalore",
  contact_info: "contact@helpinghands.org",
  donation_link: "https://donate.com/helpinghands",
  ngo_picture: "https://example.com/ngo1.jpg",
  events: [],
};

// ----- Apollo mocks -----
const ngoDetailMock = {
  request: {
    query: GET_NGO,
    variables: { id: "1" },
  },
  result: {
    data: { ngo: ngoMockData },
  },
};

const userFavoritesEmpty = {
  request: { query: GET_USER_FAVORITES },
  result: { data: { userFavorites: [] } },
};

const userFavoritesWithNgo = {
  request: { query: GET_USER_FAVORITES },
  result: { data: { userFavorites: [{ id: "fav1", ngo_id: "1" }] } },
};

const addFavoriteMock = {
  request: {
    query: ADD_FAVORITE,
    variables: { ngo_id: "1" },
  },
  result: {
    data: {
      addFavorite: {
        id: "fav1",
        ngo_id: "1",
        user_id: "user1",
        created_at: "2025-10-29",
      },
    },
  },
};

const removeFavoriteMock = {
  request: {
    query: REMOVE_FAVORITE,
    variables: { ngo_id: "1" },
  },
  result: {
    data: { removeFavorite: true },
  },
};

const addFavoriteErrorMock = {
  request: {
    query: ADD_FAVORITE,
    variables: { ngo_id: "1" },
  },
  error: new Error("Failed to add favorite"),
};

const removeFavoriteErrorMock = {
  request: {
    query: REMOVE_FAVORITE,
    variables: { ngo_id: "1" },
  },
  error: new Error("Failed to remove favorite"),
};

// ----- Helper Render Function -----
const renderNGODetails = (mocks) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={["/ngo/1"]}>
        <Routes>
          <Route path="/ngo/:id" element={<NGO_Details />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

// ----- Test Suite -----
describe("❤️ NGO_Details Favorites Functionality", () => {
  beforeEach(() => {
    localStorage.setItem("user_id", "user1");
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renders NGO details and non-favorited state", async () => {
    renderNGODetails([ngoDetailMock, userFavoritesEmpty]);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.getByText("Helping Hands")).toBeInTheDocument()
    );

    expect(screen.getByLabelText(/add to favorites/i)).toBeInTheDocument();
  });

  test("renders favorited state correctly", async () => {
    renderNGODetails([ngoDetailMock, userFavoritesWithNgo]);

    await waitFor(() =>
      expect(screen.getByText("Helping Hands")).toBeInTheDocument()
    );

    expect(screen.getByLabelText(/remove from favorites/i)).toBeInTheDocument();
  });

  test("adds NGO to favorites when button clicked", async () => {
    renderNGODetails([
      ngoDetailMock,
      userFavoritesEmpty,
      addFavoriteMock,
      userFavoritesWithNgo,
    ]);

    await waitFor(() =>
      expect(screen.getByText("Helping Hands")).toBeInTheDocument()
    );

    const addButton = screen.getByLabelText(/add to favorites/i);
    fireEvent.click(addButton);

    await waitFor(() =>
      expect(screen.getByText(/added to favorites/i)).toBeInTheDocument()
    );
  });

  test("removes NGO from favorites successfully", async () => {
    renderNGODetails([
      ngoDetailMock,
      userFavoritesWithNgo,
      removeFavoriteMock,
      userFavoritesEmpty,
    ]);

    await waitFor(() =>
      expect(screen.getByText("Helping Hands")).toBeInTheDocument()
    );

    const removeButton = screen.getByLabelText(/remove from favorites/i);
    fireEvent.click(removeButton);

    await waitFor(() =>
      expect(screen.getByText(/removed from favorites/i)).toBeInTheDocument()
    );
  });

  test("shows error message if adding favorite fails", async () => {
    renderNGODetails([ngoDetailMock, userFavoritesEmpty, addFavoriteErrorMock]);

    await waitFor(() =>
      expect(screen.getByText("Helping Hands")).toBeInTheDocument()
    );

    const addButton = screen.getByLabelText(/add to favorites/i);
    fireEvent.click(addButton);

    await waitFor(() =>
      expect(screen.getByText(/failed to add favorite/i)).toBeInTheDocument()
    );
  });

  test("shows error message if removing favorite fails", async () => {
    renderNGODetails([
      ngoDetailMock,
      userFavoritesWithNgo,
      removeFavoriteErrorMock,
    ]);

    await waitFor(() =>
      expect(screen.getByText("Helping Hands")).toBeInTheDocument()
    );

    const removeButton = screen.getByLabelText(/remove from favorites/i);
    fireEvent.click(removeButton);

    await waitFor(() =>
      expect(screen.getByText(/failed to remove favorite/i)).toBeInTheDocument()
    );
  });
});
