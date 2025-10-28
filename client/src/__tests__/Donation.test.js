
jest.mock("../apolloClient", () => ({
  __esModule: true,
  default: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
  },
}));

import React from "react";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import DonationList, {
  GET_USER_DONATIONS,
  GET_ORGANIZER_DONATIONS,
} from "../components/DonationList";
import NGO_Details, { DONATE_TO_NGO, GET_NGO } from "../pages/NGO_Details";

// === Mock data ===
const userDonationMocks = [
  {
    request: { query: GET_USER_DONATIONS },
    result: {
      data: {
        userDonations: [
          {
            id: "1",
            amount: 1000,
            message: "Keep up the great work!",
            created_at: "2025-10-01T00:00:00Z",
            ngo: {
              id: "101",
              name: "Helping Hands",
              contact_info: "help@ngo.org",
              ngo_picture: "ngo1.jpg",
            },
          },
        ],
      },
    },
  },
];

const organizerDonationMocks = [
  {
    request: { query: GET_ORGANIZER_DONATIONS },
    result: {
      data: {
        organizerDonations: [
          {
            id: "10",
            amount: 5000,
            message: "For education support",
            created_at: "2025-09-25T00:00:00Z",
            user: {
              id: "501",
              full_name: "John Doe",
              email: "john@example.com",
              phone: "9999999999",
              profile_picture: "john.jpg",
            },
            ngo: {
              id: "102",
              name: "Green Earth",
              contact_info: "contact@green.org",
              ngo_picture: "ngo2.jpg",
            },
          },
        ],
      },
    },
  },
];

const ngoDetailsMocks = [
  {
    request: {
      query: GET_NGO,
      variables: { id: "101" },
    },
    result: {
      data: {
        ngo: {
          id: "101",
          name: "Helping Hands",
          cause: "Child Welfare",
          description: "We help children get education and care.",
          location: "Bangalore",
          contact_info: "help@ngo.org",
          donation_link: "https://donate.com",
          ngo_picture: "ngo1.jpg",
          events: [],
        },
      },
    },
  },
  {
    request: {
      query: DONATE_TO_NGO,
      variables: { ngo_id: "101", amount: 1000, message: "Great work!" },
    },
    result: {
      data: {
        donateToNGO: {
          id: "201",
          amount: 1000,
          message: "Great work!",
          created_at: "2025-10-26T00:00:00Z",
        },
      },
    },
  },
];

// === Helper to search multiple names ===
async function findButtonByPossibleNames(names) {
  for (const name of names) {
    const btn = await screen.findByRole("button", { name }).catch(() => null);
    if (btn) return btn;
  }
  return null;
}

// === Tests ===
describe("🧪 Donations Functionality Tests", () => {
  it("renders user donations successfully", async () => {
    render(
      <MockedProvider mocks={userDonationMocks} addTypename={false}>
        <DonationList isOrganizer={false} />
      </MockedProvider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Helping Hands/i)).toBeInTheDocument());
    expect(screen.getByText(/Keep up the great work!/i)).toBeInTheDocument();
  });

  it("renders organizer donations successfully", async () => {
    render(
      <MockedProvider mocks={organizerDonationMocks} addTypename={false}>
        <DonationList isOrganizer={true} />
      </MockedProvider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/John Doe/i)).toBeInTheDocument());
    expect(screen.getByText(/For education support/i)).toBeInTheDocument();
  });

  it("renders NGO details and allows adding a donation", async () => {
    render(
      <MockedProvider mocks={ngoDetailsMocks} addTypename={false}>
        <MemoryRouter initialEntries={["/ngo/101"]}>
          <Routes>
            <Route path="/ngo/:id" element={<NGO_Details />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>
    );

    const ngoHeadings = await screen.findAllByText(/Helping Hands/i);
    expect(ngoHeadings.length).toBeGreaterThan(0);

    const donateBtn = await findButtonByPossibleNames([/donate/i, /support/i]);
    expect(donateBtn).toBeInTheDocument();
    fireEvent.click(donateBtn);


    await waitFor(() => {
      const modal = document.querySelector('[role="dialog"], .MuiDialog-root');
      expect(modal).not.toBeNull();
    });

    const modal = document.querySelector('[role="dialog"], .MuiDialog-root');
    const modalUtils = modal ? within(modal) : screen;

    const amountInput =
      (await modalUtils.findByPlaceholderText(/amount/i).catch(() => null)) ||
      (await modalUtils.findByLabelText(/amount/i).catch(() => null));
    const messageInput =
      (await modalUtils.findByPlaceholderText(/message/i).catch(() => null)) ||
      (await modalUtils.findByLabelText(/message/i).catch(() => null));

    expect(amountInput).toBeInTheDocument();
    expect(messageInput).toBeInTheDocument();

    fireEvent.change(amountInput, { target: { value: "1000" } });
    fireEvent.change(messageInput, { target: { value: "Great work!" } });

    const confirmBtn =
      (await modalUtils.findByRole("button", { name: /confirm/i }).catch(() => null)) ||
      (await modalUtils.findByRole("button", { name: /donate/i }).catch(() => null)) ||
      (await modalUtils.findByRole("button", { name: /submit/i }).catch(() => null));

    if (!confirmBtn) {
   
      console.log("Modal HTML:", modal?.innerHTML || "No modal found");
    }

    expect(confirmBtn).toBeInTheDocument();
    fireEvent.click(confirmBtn);

    await waitFor(() =>
      expect(
        screen.getByText(/donation successful/i)
      ).toBeInTheDocument()
    );
  });
});
