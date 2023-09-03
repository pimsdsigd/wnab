import {render, screen} from "@testing-library/react";
import {PriceView} from "./PriceView"
import React from "react";

describe("test", () => {
    it("component is ok", () => {
        render(<PriceView value={564}/>);
        expect(screen.getByText(/564.*/))
            .toBeInTheDocument();
    });
});