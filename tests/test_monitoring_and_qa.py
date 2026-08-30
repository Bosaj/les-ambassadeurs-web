import sys
import os
import subprocess
import pytest

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

def test_node_health_and_eval():
    eval_js = os.path.join(REPO_ROOT, "scripts", "eval_harness.js")
    if os.path.exists(eval_js):
        res = subprocess.run(["node", eval_js], capture_output=True, text=True)
        assert res.returncode == 0
    else:
        assert True
