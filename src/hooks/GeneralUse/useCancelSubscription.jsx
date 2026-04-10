import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiWrapper } from "../../utils/Functions/apiWrapper";
import { decryptData } from "../../Helper/EssentilaMethods/Decryption";
import { toast } from "react-toastify";
import { UserContext } from "../../Context/UserContext";


const useCancelSubscription = (cancelledBy, queryKeysToInvalidate = []) => {
    const queryClient = useQueryClient();
    const [confirmModal, setConfirmModal] = useState({ open: false, subscriptionId: null });
    const { userDetails } = useContext(UserContext)

    const { mutateAsync, isPending } = useMutation({
        mutationFn: (subscriptionId) =>
            apiWrapper({
                endpoint: `/api/plans/cancel-subscription/${subscriptionId}/${cancelledBy}`,
                method: "PUT",
                payload: {
                    accountId: userDetails?._id
                },
            }),
        onSuccess: () => {
            toast.success("Subscription cancelled successfully");
            queryKeysToInvalidate.forEach((key) => {
                queryClient.invalidateQueries({ queryKey: [key] });
            });
            setConfirmModal({ open: false, subscriptionId: null });
        },
        onError: (err) => {
            try {
                const dec = decryptData(err.response?.data?.data);
                toast.error(dec?.message || "Failed to cancel subscription");
            } catch {
                toast.error("Failed to cancel subscription");
            }
            setConfirmModal({ open: false, subscriptionId: null });
        },
    });

    const requestCancel = (subscriptionId) => {
        setConfirmModal({ open: true, subscriptionId });
    };

    const confirmCancel = () => {
        if (confirmModal.subscriptionId) {
            mutateAsync(confirmModal.subscriptionId);
        }
    };

    const closeModal = () => {
        if (!isPending) {
            setConfirmModal({ open: false, subscriptionId: null });
        }
    };

    return {
        requestCancel,
        confirmCancel,
        closeModal,
        isPending,
        isModalOpen: confirmModal.open,
    };
};

export default useCancelSubscription;
