const API_URL = "https://phf-order-reminder.vercel.app/api";
export const api = {
  metadata: {
    getDeadline: () => fetch(`${API_URL}/metadata/deadline`).then((res) => res.json()),
    setDeadline: (deadline: string) =>
      fetch(`${API_URL}/metadata/deadline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deadline }),
      }).then((res) => res.json()),
  },
  todos: {
    list: (date: string) => {
      return fetch(`${API_URL}/todos?date=${date}`).then((res) => res.json());
    },
    create: (data: { text: string; createdBy: string; date: string }) =>
      fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => {
        return res.json();
      }),
    update: (id: string, data: any) =>
      fetch(`${API_URL}/todo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json()),
    delete: (id: string) =>
      fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
      }).then((res) => res.json()),
  },
};

export const handleApiError = (error: any) => {
  console.error(error);
  if (error.response) {
    // Server responded with error
    throw new Error(error.response.data?.error || "Server error");
  } else if (error.request) {
    // Request made but no response
    throw new Error("No response from server");
  } else {
    // Other errors
    throw new Error("Error making request");
  }
};
