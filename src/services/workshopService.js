// services/workshopService.js

// services/workshopService.js

export const addWorkshopToUniversity = async (workshopData) => {
  const baseUrl = "https://skillonx-server.onrender.com/";
  try {
    console.log("Sending workshop data:", workshopData); // Debug log

    const response = await fetch(
      "https://skillonx-server.onrender.com/add/workshops",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(workshopData),
      }
    );

    // Log the response status and headers for debugging
    console.log("Response status:", response.status);

    // First check if response is ok
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Error response:", errorData);
      throw new Error(errorData || "Failed to add workshop");
    }

    // Then try to parse JSON
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error in addWorkshopToUniversity:", error);
    throw error;
  }
};

export const getUniversityWorkshops = async (universityId, token) => {
  try {
    const response = await fetch(
      `/api/universities/${universityId}/workshops`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(error.message);
  }
};
