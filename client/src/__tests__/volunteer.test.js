jest.mock("../apolloClient", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
  },
}));

import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { gql } from "@apollo/client";
import MyVolunteering from "../components/MyVolunteering";
import VolunteerList from "../components/VolunteerList";
import NGO_Details, {
  REGISTER_VOLUNTEER,
  GET_ORGANIZER_VOLUNTEERS,
} from "../pages/NGO_Details";

// ---------- Queries ----------
const GET_USER_VOLUNTEERING = gql`
  query getUserVolunteering($userId: ID!) {
    userVolunteers(userId: $userId) {
      id
      registered_at
      event {
        id
        title
        description
        event_date
        location
        ngo {
          id
          name
          ngo_picture
        }
      }
      user {
        id
        full_name
        profile_picture
      }
    }
  }
`;

const REMOVE_VOLUNTEER = gql`
  mutation removeVolunteer($eventId: ID!, $userId: ID!) {
    removeVolunteer(event_id: $eventId, user_id: $userId)
  }
`;

const GET_NGO = gql`
  query getNGO($id: ID!) {
    ngo(id: $id) {
      id
      name
      cause
      description
      location
      contact_info
      donation_link
      ngo_picture
      events {
        id
        title
        description
        event_date
        location
        volunteers_needed
        volunteers {
          id
          user_id
          registered_at
        }
      }
    }
  }
`;

// ---------- Shared Mocks ----------
const baseMocks = [
  {
    request: { query: GET_USER_VOLUNTEERING, variables: { userId: "u1" } },
    result: {
      data: {
        userVolunteers: [
          {
            id: "v1",
            registered_at: "1720000000000",
            event: {
              id: "e1",
              title: "Beach Cleanup",
              description: "Join us to clean up the beach.",
              event_date: "1730000000000",
              location: "Goa Beach",
              ngo: { id: "n1", name: "Eco Foundation", ngo_picture: "/ngo1.png" },
            },
            user: { id: "u1", full_name: "John Doe", profile_picture: "/user1.png" },
          },
        ],
      },
    },
  },
  {
    request: { query: REMOVE_VOLUNTEER, variables: { eventId: "e1", userId: "u1" } },
    result: { data: { removeVolunteer: true } },
  },
  {
    request: { query: GET_ORGANIZER_VOLUNTEERS },
    result: {
      data: {
        organizerVolunteers: [
          {
            id: "o1",
            user: {
              id: "u1",
              full_name: "John Doe",
              email: "john@example.com",
              phone: "1234567890",
              profile_picture: "/user1.png",
              role: "Volunteer",
              description: "Passionate about environmental causes.",
            },
            event: {
              id: "e1",
              title: "Tree Plantation Drive",
              event_date: "1730000000000",
            },
            registered_at: "1720000000000",
          },
        ],
      },
    },
  },
];

// ---------- Tests for Components ----------
describe("Volunteer Components", () => {
  it("renders user volunteering events correctly", async () => {
    render(
      <MockedProvider mocks={baseMocks} addTypename={false}>
        <MyVolunteering userId="u1" />
      </MockedProvider>
    );
    expect(await screen.findByText(/Beach Cleanup/i)).toBeInTheDocument();
  });

  it("unregisters user from event successfully", async () => {
    render(
      <MockedProvider mocks={baseMocks} addTypename={false}>
        <MyVolunteering userId="u1" />
      </MockedProvider>
    );
    const btn = await screen.findByRole("button", { name: /unregister/i });
    await act(async () => fireEvent.click(btn));
    await waitFor(() =>
      expect(screen.getByText(/Successfully unregistered/i)).toBeInTheDocument()
    );
  });

  it("renders organizer volunteer list correctly", async () => {
    render(
      <MockedProvider mocks={baseMocks} addTypename={false}>
        <VolunteerList />
      </MockedProvider>
    );
    expect(await screen.findByText(/John Doe/i)).toBeInTheDocument();
    expect(await screen.findByText(/Tree Plantation Drive/i)).toBeInTheDocument();
  });
});

// ---------- Registration Test ----------
const registrationMocks = [
  {
    request: { query: GET_NGO, variables: { id: "n1" } },
    result: {
      data: {
        ngo: {
          id: "n1",
          name: "Eco Foundation",
          cause: "Environment",
          description: "NGO focused on environmental work",
          location: "Goa",
          contact_info: "eco@example.com",
          donation_link: "https://donate.example.com",
          ngo_picture: "/ngo1.png",
          events: [
            {
              id: "e1",
              title: "Beach Cleanup",
              description: "Join us to clean up the beach",
              event_date: "1730000000000",
              location: "Goa Beach",
              volunteers_needed: 10,
              volunteers: [],
            },
          ],
        },
      },
    },
  },
  {
    request: { query: REGISTER_VOLUNTEER, variables: { event_id: "e1" } },
    result: {
      data: {
        registerVolunteer: {
          id: "rv1",
          user_id: "u1",
          event_id: "e1",
          registered_at: "2025-10-28T12:00:00Z",
        },
      },
    },
  },
];

describe("Volunteer Registration", () => {
  test(
    "registers a new volunteer successfully",
    async () => {
      await act(async () => {
        render(
          <MockedProvider mocks={registrationMocks} addTypename={false}>
            <MemoryRouter initialEntries={["/ngo/n1"]}>
              <Routes>
                <Route path="/ngo/:id" element={<NGO_Details />} />
              </Routes>
            </MemoryRouter>
          </MockedProvider>
        );
      });

      const volunteerButton = await screen.findByRole("button", { name: /volunteer/i });
      await act(async () => fireEvent.click(volunteerButton));

      await waitFor(() =>
        expect(screen.getByText(/Confirm Registration/i)).toBeInTheDocument()
      );

      const confirmButton = screen.getByText(/Confirm Registration/i);
      await act(async () => fireEvent.click(confirmButton));

      await waitForElementToBeRemoved(() => screen.queryByText(/Confirm Registration/i));

      await waitFor(() => {
        const successAlert = screen.queryByText(
          /Successfully registered for the event/i,
          { exact: false }
        );
        expect(successAlert).toBeTruthy();
      });
    },
    15000
  );
});
