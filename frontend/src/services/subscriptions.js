import api from "./api";


// ============================================================
// PLANS
// ============================================================

export const getSubscriptionPlans = async () => {

  const response = await api.get(
    "/subscriptions/plans/"
  );

  return response.data;
};


// ============================================================
// CURRENT SUBSCRIPTION
// ============================================================

export const getCurrentSubscription = async () => {

  const response = await api.get(
    "/subscriptions/current/"
  );

  return response.data;
};


// ============================================================
// SUBSCRIPTION HISTORY
// ============================================================

export const getSubscriptionHistory = async () => {

  const response = await api.get(
    "/subscriptions/history/"
  );

  return response.data;
};


// ============================================================
// ACTIVATE SUBSCRIPTION
// ============================================================

export const activateSubscription = async (
  planId
) => {

  const response = await api.post(
    "/subscriptions/activate/",
    {
      plan_id: planId,
    }
  );

  return response.data;
};