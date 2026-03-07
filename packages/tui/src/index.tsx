#!/usr/bin/env bun
import React from "react";
import { render } from "ink";
import { App } from "./app.tsx";
import { getBaseUrl } from "./get-base-url.ts";

const { waitUntilExit } = render(<App baseUrl={getBaseUrl()} />);
await waitUntilExit();
