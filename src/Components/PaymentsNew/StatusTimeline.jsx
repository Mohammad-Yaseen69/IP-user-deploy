import React from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import "./styles/Timeline.css"
import { Check } from 'react-feather';

const Timeline = ({ items }) => {
    return (
        <VerticalTimeline layout={"1-column"}>
            {items.map((item) => (
                <VerticalTimelineElement
                    className="vertical-timeline-element--work"
                    animate={true}
                    iconStyle={{
                        boxShadow: "none",
                        background: "linear-gradient(to right bottom, #e64067, #5926f0, #4828a0)",
                        height: "25px",
                        width: "25px"
                    }}
                    icon={<div style={{
                        borderRadius: "100%",
                        height: "100%",
                        width: "100%"
                    }}><Check size={16} /></div>}
                    key={item.id}
                    contentStyle={{
                        background: "transparent",
                        padding: "0",
                        height: "fit-content",
                        border: "none",
                        boxShadow: "none",
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        marginLeft: "35px",
                    }}
                >
                    <div style={{ flex: 1 }}>
                        <h5 style={{ fontSize: "1rem", marginBottom: ".25rem" }}>{item.name}</h5>
                        <span style={{ color: "#979797", display: "flex", gap: ".5rem", fontSize: ".8rem" }}>
                            <span>13/07/23</span>
                            <span>12:35 PM</span>
                        </span>
                    </div>
                    <div>
                        <span style={{
                            background: "#15BD4E",
                            color: "white",
                            padding: ".4rem .75rem",
                            borderRadius: "40px",
                            fontSize: ".7rem"
                        }}>Completed</span>
                    </div>
                </VerticalTimelineElement>
            ))}
        </VerticalTimeline>
    );
};

export default Timeline;