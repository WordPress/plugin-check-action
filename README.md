# WordPress Plugin Check Action

A GitHub action to run [Plugin Check](https://wordpress.org/plugins/plugin-check/) against your plugin.

Results are posted as file annotations.

## Example Output

<img width="887" alt="Plugin Check error messages output on GitHub Actions" src="https://github.com/wordpress/plugin-check-action/assets/841956/31292472-51d5-487d-9878-1940a20e1e0b">

## Usage

See [action.yml](action.yml)

```yaml
- uses: wordpress/plugin-check-action@v1
  with:
    # Personal access token (PAT) used to comment on pull requests.
    # Not currently used.
    #
    # [Learn more about creating and using encrypted secrets](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets)
    #
    # Default: ${{ github.token }}
    repo-token: ''

    # Build directory of your plugin.
    # Defaults to current directory / repository root.
    #
    # Default: './'
    build-dir: ''

    # List of checks to run.
    # Each check should be separated with new lines.
    # Examples: i18n_usage, file_type, late_escaping.
    # By default, all checks are run.
    #
    # Default: ''
    checks: ''

    # List of checks to exclude from running.
    # Each check should be separated with new lines.
    # Examples: i18n_usage, file_type, late_escaping.
    # Applies after the `checks` input.
    #
    # Default: ''
    exclude-checks: ''

    # List of error codes to ignore.
    # Each error code should be separated with new lines.
    # Examples: textdomain_mismatch, WordPress.Security.EscapeOutput.OutputNotEscaped.
    #
    # Default: ''
    ignore-codes: ''

    # List of categories to limit checks to.
    # Each category should be separated with new lines.
    # Examples: general, security
    # By default, checks in all categories are run.
    #
    # Default: ''
    categories: ''

    # List of files (file paths) to exclude from checks.
    # Each file should be separated with new lines.
    #
    # Default: ''
    exclude-files: ''
    
    # List of directories to exclude from checks.
    # Each directory should be separated with new lines.
    #
    # Default: ''
    exclude-directories: ''
    
    # Whether to ignore warnings reported by Plugin Check.
    #
    # Default: false
    ignore-warnings: ''

    # Whether to ignore errors reported by Plugin Check.
    #
    # Default: false
    ignore-errors: ''

    # Whether to include experimental checks.
    #
    # Default: true
    include-experimental: ''

    # WordPress version to use. Supports "latest" or "trunk".
    #
    # Default: latest
    wp-version: ''

    # Severity level.
    #
    # Default: ''
    severity: ''

    # Error severity level.
    #
    # Default: ''
    error-severity:

    # Warning severity level.
    #
    # Default: ''
    warning-severity:

    # Include errors with lower severity than the threshold as other type.
    #
    # Default: ''
    include-low-severity-errors: ''

    # Include warnings with lower severity than the threshold as other type.
    #
    # Default: ''
    include-low-severity-warnings: ''

    # Slug to override the default.
    #
    # Default: ''
    slug:

    # Treat everything as an error.
    #
    # Default: false
    strict: ''
