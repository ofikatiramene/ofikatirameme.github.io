const $links = (title, links) => $(
    "section",{},[
        $("h2", {}, [title]),
        $("ul", {}, links.map(([name, link, newTab = false]) => 
            $("li", {}, [
                $("a", {href: link, target: newTab? "_blank": ""}, [name])
            ])
        ))
    ]
)

const links = [
    [
        "Links",
        [
            ["Twitter", "https://twitter.com/ofikatiramene", true],
            ["BionicleBot", "https://twitter.com/bioniclebot", true],
        ]
    ],
    [
        "Projects",
        [
            ["Sand", "/sand"],
        ]
    ],
]

document.body.append(...links.map(link => $links(...link)))

const ctx = Mondrian.Context.create(16, 16)

