import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Card, CardBody, CardHeader, Spinner } from 'reactstrap'
import { H4 } from '../../AbstractElements'
import SessionItem from './SessionItem'
import { useTranslation } from 'react-i18next';
import { UserContext } from '../../Context/UserContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { apiWrapper } from '../../utils/Functions/apiWrapper';
const LIMIT = 10;

const Sessions = () => {
    const { t } = useTranslation()
    const { userDetails } = useContext(UserContext)

    const observerRef = useRef(null)

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ['loginHistory', userDetails?._id],
        queryFn: ({ pageParam = 1 }) =>
            apiWrapper({
                endpoint: `/api/login/get-user-login-history/${userDetails._id}?page=${pageParam}&limit=${LIMIT}`,
                method: 'GET',
                isDecrypted: true,
            }),
        getNextPageParam: (lastPage) =>
            lastPage?.pagination?.hasNextPage
                ? lastPage?.pagination?.page + 1
                : undefined,
        enabled: !!userDetails?._id,
    })

    const sessions = data?.pages?.flatMap(page => page?.history ?? []) ?? []

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.5 }
        )

        if (observerRef.current) observer.observe(observerRef.current)
        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <Card>
            <CardHeader>
                <div>
                    <h4>{t("Sessions")}</h4>
                    <p style={{ marginTop: ".5rem", color: "black", fontWeight: "300" }}>{t("This is a list of devices that have logged into your account.")}</p>
                </div>
            </CardHeader>
            <CardBody style={{ maxHeight: "700px", overflowY: "auto" }}>

                {isLoading && (
                    <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
                )}

                {sessions.map((session, index) => (
                    <SessionItem
                        key={session._id}
                        session={session}
                        index={index}
                    />
                ))}

                <div ref={observerRef} style={{ height: "1px" }} />

                {isFetchingNextPage && (
                    <p style={{ textAlign: "center", color: "#888", padding: "10px" }}>
                        <Spinner />
                    </p>
                )}

                {!hasNextPage && sessions.length > 0 && (
                    <p style={{ textAlign: "center", color: "#aaa", padding: "10px" }}>
                        {t("No more sessions")}
                    </p>
                )}

                {!isLoading && sessions.length === 0 && (
                    <p style={{ textAlign: "center", color: "#aaa", padding: "10px" }}>
                        {t("No login history found")}
                    </p>
                )}

            </CardBody>
        </Card>
    )
}

export default Sessions