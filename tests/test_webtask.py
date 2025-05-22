"""
Tests for webtask
"""

import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock, ANY
from webtask.server import webtaskServer, WebTaskHandler
from webtask.main import main


class TestWebTaskServer:
    """Test webtaskServer class"""

    def test_server_initialization(self):
        """Test server initialization with default values"""
        server = webtaskServer()
        assert server.host == "localhost"
        assert server.port == 8000
        assert server.open_browser is True
        
    @patch('http.server.SimpleHTTPRequestHandler.__init__')
    def test_webtask_handler_initialization(self, mock_init):
        """Test WebTaskHandler initialization"""
        # Setup mocks
        mock_init.return_value = None
        
        # Create a mock for the static directory path
        mock_static_dir = MagicMock()
        mock_static_dir.__str__.return_value = '/mock/static'
        
        # Patch the Path class to return our mock
        with patch('pathlib.Path') as mock_path:
            # Configure the Path mock to return our mock_static_dir when divided by 'static'
            mock_path.return_value.parent = mock_path.return_value
            mock_path.return_value.__truediv__.return_value = mock_static_dir
            
            # Create handler with mocked components
            handler = WebTaskHandler(None, None, None)
            
            # Verify the handler was initialized with the correct directory
            mock_init.assert_called_once()
            call_args = mock_init.call_args[1]
            assert 'directory' in call_args
            assert 'static' in str(call_args['directory'])

    def test_server_initialization_with_params(self):
        """Test server initialization with custom parameters"""
        server = webtaskServer(host="127.0.0.1", port=9000, open_browser=False)
        assert server.host == "127.0.0.1"
        assert server.port == 9000
        assert server.open_browser is False


class TestMain:
    """Test main entry point"""

    @patch('webtask.main.webtaskServer')
    @patch('sys.argv', ['webtask'])
    def test_main_default_args(self, mock_server_class):
        """Test main function with default arguments"""
        mock_server = MagicMock()
        mock_server_class.return_value = mock_server

        main()

        mock_server_class.assert_called_once_with(
            host="localhost",
            port=8000,
            open_browser=True
        )
        mock_server.run.assert_called_once()

    @patch('webtask.main.webtaskServer')
    @patch('sys.argv', ['webtask', '--host', '0.0.0.0', '--port', '9000', '--no-browser'])
    def test_main_custom_args(self, mock_server_class):
        """Test main function with custom arguments"""
        mock_server = MagicMock()
        mock_server_class.return_value = mock_server

        main()

        mock_server_class.assert_called_once_with(
            host="0.0.0.0",
            port=9000,
            open_browser=False
        )
        mock_server.run.assert_called_once()