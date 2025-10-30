jest.mock("../apolloClient", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
  },
}));

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import NGO_Listings, { GET_ALL_NGOS } from "../pages/NGO_Listings";
import NGO_Details, { GET_NGO } from "../pages/NGO_Details";

const mockNgos = [
  {
    id: "1",
    name: "Helping Hands",
    cause: "Education",
    description: "We help underprivileged children access quality education.",
    location: "Bangalore",
    ngo_picture: "https://example.com/ngo1.jpg",
    created_at: "2025-10-01",
  },
  {
    id: "2",
    name: "Green Earth",
    cause: "Environment",
    description: "Focused on tree planting and environmental awareness.",
    location: "Delhi",
    ngo_picture: "https://example.com/ngo2.jpg",
    created_at: "2025-09-20",
  },
];

const mocks = [
  {
    request: {
      query: GET_ALL_NGOS,
    },
    result: {
      data: {
        ngos: mockNgos,
      },
    },
  },
];

describe("NGO List Page", () => {
  test("renders loading state initially", () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={[]} addTypename={false}>
          <NGO_Listings />
        </MockedProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test("renders list of NGOs after data is fetched", async () => {
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <NGO_Listings />
        </MockedProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText("Helping Hands")).toBeInTheDocument();
      expect(screen.getByText("Green Earth")).toBeInTheDocument();
    });
  });

  test("renders error state when query fails", async () => {
    const errorMocks = [
      {
        request: { query: GET_ALL_NGOS },
        error: new Error("Failed to fetch"),
      },
    ];
    render(
      <MemoryRouter>
        <MockedProvider mocks={errorMocks} addTypename={false}>
          <NGO_Listings />
        </MockedProvider>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});

const ngoDetailMock = [
  {
    request: {
      query: GET_NGO,
      variables: { id: "1" },
    },
    result: {
      data: {
        ngo: {
          id: "1",
          name: "Helping Hands",
          cause: "Education",
          description:
            "We help underprivileged children access quality education.",
          location: "Bangalore",
          contact_info: "contact@helpinghands.org",
          donation_link: "https://donate.com/helpinghands",
          ngo_picture: "https://example.com/ngo1.jpg",
          events: [
            {
              id: "E1",
              title: "Back to School Drive",
              description: "Providing books and uniforms to students.",
              event_date: "2025-11-10",
              location: "Bangalore",
              volunteers_needed: 20,
              volunteers: [],
            },
          ],
        },
      },
    },
  },
];

describe("NGO Details Page", () => {
  test("renders NGO details after data is fetched", async () => {
    render(
      <MockedProvider mocks={ngoDetailMock} addTypename={false}>
        <MemoryRouter initialEntries={["/ngo/1"]}>
          <Routes>
            <Route path="/ngo/:id" element={<NGO_Details />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Helping Hands")).toBeInTheDocument();
      expect(
        screen.getByText(
          "We help underprivileged children access quality education."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Back to School Drive")).toBeInTheDocument();
    });
  });

  test("renders error state when query fails", async () => {
    const errorMocks = [
      {
        request: {
          query: GET_NGO,
          variables: { id: "1" },
        },
        error: new Error("Failed to fetch NGO details"),
      },
    ];
    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <MemoryRouter initialEntries={["/ngo/1"]}>
          <Routes>
            <Route path="/ngo/:id" element={<NGO_Details />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch/i)).toBeInTheDocument();
    });
  });
});
