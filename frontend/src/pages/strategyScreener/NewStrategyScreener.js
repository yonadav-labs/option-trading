import React from "react";
import {CssBaseline, Container } from "@material-ui/core";
import LandingView from "./LandingView";

export default function NewStrategyScreener() {
    return (
        <Container className="min-vh-100">
            <CssBaseline />
            <LandingView/>
        </Container>
    );
}
