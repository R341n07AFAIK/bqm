"""Utility script to print a brief statement about including this project in GPT-based workflows."""

INCLUSION_MESSAGE = (
    "This project is ready for GPT-driven inclusion. "
    "Ensure dependencies are installed and import the appropriate modules."
)


def print_inclusion_message() -> None:
    """Print the inclusion message for downstream automation."""
    print(INCLUSION_MESSAGE)


if __name__ == "__main__":
    print_inclusion_message()
