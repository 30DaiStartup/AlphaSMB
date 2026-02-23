#!/usr/bin/env python3
"""One-time database initialization."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from src.config import load
from src.db import init_db


def main():
    cfg = load(require_linkedin=False)
    db_path = cfg["database"]["path"]
    init_db(db_path)
    print(f"Database initialized at {db_path}")


if __name__ == "__main__":
    main()
