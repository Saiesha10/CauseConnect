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
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import EventList, {
  GET_EVENTS,
  UPDATE_EVENT,
  DELETE_EVENT,
} from "../components/EventList";
import CreateEvent, { CREATE_EVENT } from "../pages/CreateEvent";

const mockEvents = [
  {
    id: "1",
    title: "Beach Cleanup",
    description: "Cleaning up the local beach area.",
    event_date: "2025-11-20",
    location: "Goa",
    volunteers_needed: 50,
  },
  {
    id: "2",
    title: "Tree Plantation",
    description: "Planting 200 trees in the city outskirts.",
    event_date: "2025-12-10",
    location: "Bangalore",
    volunteers_needed: 100,
  },
];

const mocks = [
  {
    request: {
      query: GET_EVENTS,
      variables: { organizerId: "1" },
    },
    result: { data: { events: mockEvents } },
  },
  {
    request: {
      query: CREATE_EVENT,
      variables: {
        ngo_id: "1",
        title: "Food Distribution",
        description: "Provide meals to the needy.",
        event_date: "2025-11-30",
        location: "Mumbai",
        volunteers_needed: 100,
      },
    },
    result: {
      data: {
        createEvent: {
          id: "3",
          title: "Food Distribution",
          description: "Provide meals to the needy.",
          event_date: "2025-11-30",
          location: "Mumbai",
          volunteers_needed: 100,
          ngo: { name: "Helping Hands" },
        },
      },
    },
  },
  {
    request: {
      query: UPDATE_EVENT,
      variables: {
        id: "1",
        title: "Beach Cleanup Revised",
        description: "Updated cleanup event description.",
        event_date: "2025-11-21",
        location: "Goa Beach",
        volunteers_needed: 60,
      },
    },
    result: {
      data: {
        updateEvent: {
          id: "1",
          title: "Beach Cleanup Revised",
          description: "Updated cleanup event description.",
          event_date: "2025-11-21",
          location: "Goa Beach",
          volunteers_needed: 60,
        },
      },
    },
  },
  {
    request: {
      query: DELETE_EVENT,
      variables: { id: "2" },
    },
    result: { data: { deleteEvent: { id: "2" } } },
  },
];

describe("Event Functionality Tests", () => {
  it("renders event list successfully", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <EventList organizer userId="1" />
      </MockedProvider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(await screen.findByText(/Beach Cleanup/i)).toBeInTheDocument();
    expect(screen.getByText(/Tree Plantation/i)).toBeInTheDocument();
  });

  it("creates a new event successfully", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={["/create-event"]}>
          <Routes>
            <Route path="/create-event" element={<CreateEvent />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    fireEvent.change(screen.getByLabelText(/event title/i), {
      target: { value: "Food Distribution" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Provide meals to the needy." },
    });
    fireEvent.change(screen.getByLabelText(/event date/i), {
      target: { value: "2025-11-30" },
    });
    fireEvent.change(screen.getByLabelText(/location/i), {
      target: { value: "Mumbai" },
    });
    fireEvent.change(screen.getByLabelText(/volunteers needed/i), {
      target: { value: "100" },
    });

    fireEvent.click(screen.getByRole("button", { name: /create/i }));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() =>
      expect(mocks[1].result.data.createEvent.title).toBe("Food Distribution")
    );
  });

  it("updates an event successfully", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <EventList organizer userId="1" />
      </MockedProvider>
    );

    await screen.findByText(/Beach Cleanup/i);

    const editButton = screen.getAllByRole("button", { name: /edit/i })[0];
    fireEvent.click(editButton);

    const titleInput = await screen.findByDisplayValue(/Beach Cleanup/i);
    fireEvent.change(titleInput, {
      target: { value: "Beach Cleanup Revised" },
    });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() =>
      expect(mocks[2].result.data.updateEvent.title).toBe(
        "Beach Cleanup Revised"
      )
    );
  });

  it("deletes an event successfully", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <EventList organizer userId="1" />
      </MockedProvider>
    );

    await screen.findByText(/Tree Plantation/i);

    const deleteButton = screen.getAllByRole("button", { name: /delete/i })[1];
    fireEvent.click(deleteButton);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    await waitFor(() =>
      expect(mocks[3].result.data.deleteEvent.id).toBe("2")
    );
  });
});
