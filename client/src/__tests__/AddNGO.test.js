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
    Promise.resolve("https://mock.cloudinary.com/ngo-image.jpg")
  ),
}));

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import "@testing-library/jest-dom";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Add_NGO, {
  CREATE_NGO,
  UPDATE_NGO,
  GET_NGO_BY_ID,
} from "../pages/Add_NGO";

// ----- Mock data -----
const mockNGO = {
  id: "1",
  name: "Helping Hands",
  cause: "Education",
  description: "Helping kids learn better",
  location: "Bangalore",
  contact_info: "help@ngo.com",
  donation_link: "https://ngo.com/donate",
  ngo_picture: "https://example.com/ngo1.jpg",
};

// ----- Apollo mocks -----
const getNGOMock = {
  request: {
    query: GET_NGO_BY_ID,
    variables: { id: "1" },
  },
  result: {
    data: { ngo: mockNGO },
  },
};

const createNGOMock = {
  request: {
    query: CREATE_NGO,
    variables: {
      name: mockNGO.name,
      cause: mockNGO.cause,
      description: mockNGO.description,
      location: mockNGO.location,
      contact_info: mockNGO.contact_info,
      donation_link: mockNGO.donation_link,
      ngo_picture: mockNGO.ngo_picture,
    },
  },
  result: {
    data: {
      createNGO: { ...mockNGO },
    },
  },
};

const updateNGOMock = {
  request: {
    query: UPDATE_NGO,
    variables: {
      id: "1",
      ...mockNGO,
    },
  },
  result: {
    data: {
      updateNGO: { ...mockNGO, name: "Helping Hands Updated" },
    },
  },
};

const createErrorMock = {
  request: {
    query: CREATE_NGO,
    variables: {
      name: mockNGO.name,
      cause: mockNGO.cause,
      description: mockNGO.description,
      location: mockNGO.location,
      contact_info: mockNGO.contact_info,
      donation_link: mockNGO.donation_link,
      ngo_picture: mockNGO.ngo_picture,
    },
  },
  error: new Error("Failed to create NGO"),
};

const updateErrorMock = {
  request: {
    query: UPDATE_NGO,
    variables: { id: "1", ...mockNGO },
  },
  error: new Error("Failed to update NGO"),
};

// ----- Render helper -----
const renderAddNGO = (mocks, path = "/add-ngo") => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/add-ngo" element={<Add_NGO />} />
          <Route path="/ngo/:id" element={<Add_NGO />} />
        </Routes>
      </MemoryRouter>
    </MockedProvider>
  );
};

// ----- Test Suite -----
describe("🏢 Add_NGO Component", () => {
  test("renders loading state initially when editing", () => {
    renderAddNGO([], "/ngo/1");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  
test("renders 'Add New NGO' form and creates NGO successfully", async () => {
  renderAddNGO([createNGOMock]);

  expect(await screen.findByText(/add new ngo/i)).toBeInTheDocument();

  fireEvent.change(screen.getByRole("textbox", { name: /ngo name/i }), {
    target: { value: mockNGO.name },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /cause/i }), {
    target: { value: mockNGO.cause },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
    target: { value: mockNGO.description },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /location/i }), {
    target: { value: mockNGO.location },
  });

  fireEvent.click(screen.getByRole("button", { name: /add ngo/i }));

  // ✅ Wait for snackbar with flexible matcher
  await waitFor(() =>
    expect(
      screen.getByText(/NGO created successfully!/i)
    ).toBeInTheDocument()
  );

  // ✅ Ensure navigate was called
  expect(mockNavigate).toHaveBeenCalled();
});

test("renders 'Edit NGO' form and updates NGO successfully", async () => {
  renderAddNGO([getNGOMock, updateNGOMock], "/ngo/1");

  await waitFor(() =>
    expect(screen.getByDisplayValue("Helping Hands")).toBeInTheDocument()
  );

  fireEvent.change(screen.getByRole("textbox", { name: /ngo name/i }), {
    target: { value: "Helping Hands Updated" },
  });

  fireEvent.click(screen.getByRole("button", { name: /update ngo/i }));

  await waitFor(() =>
    expect(
      screen.getByText(/NGO updated successfully!/i)
    ).toBeInTheDocument()
  );

  expect(mockNavigate).toHaveBeenCalled();
});

test("shows validation error when required fields missing", async () => {
  renderAddNGO([]);

  expect(await screen.findByText(/add new ngo/i)).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /add ngo/i }));

  await waitFor(() =>
    expect(
      screen.getByText(/Please fill all required fields\./i)
    ).toBeInTheDocument()
  );
});




// ✅ 4. Create NGO fails
test("shows error when create NGO fails", async () => {
  renderAddNGO([createErrorMock]);

  expect(await screen.findByText(/add new ngo/i)).toBeInTheDocument();

  fireEvent.change(screen.getByRole("textbox", { name: /ngo name/i }), {
    target: { value: mockNGO.name },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /cause/i }), {
    target: { value: mockNGO.cause },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /description/i }), {
    target: { value: mockNGO.description },
  });
  fireEvent.change(screen.getByRole("textbox", { name: /location/i }), {
    target: { value: mockNGO.location },
  });

  fireEvent.click(screen.getByRole("button", { name: /add ngo/i }));

  // ✅ Match any kind of failure message text
  expect(await screen.findByText(/failed|error/i)).toBeInTheDocument();
});


  test("shows error when update NGO fails", async () => {
    renderAddNGO([getNGOMock, updateErrorMock], "/ngo/1");

    await waitFor(() =>
      expect(screen.getByDisplayValue("Helping Hands")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole("button", { name: /update ngo/i }));

    await waitFor(() =>
      expect(screen.getByText(/failed to update ngo/i)).toBeInTheDocument()
    );
  });

  test("handles successful image upload", async () => {
    const { uploadToCloudinary } = require("../utils/cloudinary");
    uploadToCloudinary.mockResolvedValueOnce(
      "https://mock.cloudinary.com/uploaded.jpg"
    );

    renderAddNGO([]);

    await screen.findByText("Add New NGO");

    const uploadButton = screen.getByText(/upload picture/i);
    const fileInput = uploadButton.querySelector("input[type='file']");

    const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() =>
      expect(
        screen.getByText(/image uploaded successfully!/i)
      ).toBeInTheDocument()
    );
  });

  test("handles failed image upload", async () => {
    const { uploadToCloudinary } = require("../utils/cloudinary");
    uploadToCloudinary.mockRejectedValueOnce(new Error("Upload failed"));

    renderAddNGO([]);

    await screen.findByText("Add New NGO");

    const uploadButton = screen.getByText(/upload picture/i);
    const fileInput = uploadButton.querySelector("input[type='file']");

    const file = new File(["dummy"], "test.jpg", { type: "image/jpeg" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() =>
      expect(screen.getByText(/failed to upload image/i)).toBeInTheDocument()
    );
  });
});
