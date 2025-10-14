# WordPress Plugin Check Action

A GitHub action to run [Plugin Check](https://wordpress.org/plugins/plugin-check/) against your plugin.

Results are posted as file annotations.

## Example

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
```

### Basic

The simplest way to get up and running with your plugin.

Add a workflow (`.github/workflows/build-test.yml`):

```yaml
name: 'build-test'
on: # rebuild any PRs and main branch changes
  pull_request:
  push:
    branches:
    - main
    - 'releases/*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3

    - name: Run plugin check
      uses: wordpress/plugin-check-action@v1
```

### Advanced Usage

The basic example above covers many use cases, but sometimes plugins can be a bit more
complex and involve some sort of build process.
Also, if you already use tools like PHPCS, you might want to skip the PHPCS-based checks
from Plugin Check but focus on the ones that are more useful for you.

```yaml
steps:
- name: Checkout
  uses: actions/checkout@v3

# Here's where you would run your custom build process
# ...
# ...

- name: Build plugin
  run: npm run build

- name: Run plugin check
  uses: wordpress/plugin-check-action@v1
  with:
    build-dir: './my-awesome-plugin'
    exclude-directories: 'prefixed_vendor_dir,another_dir_to_ignore'
    categories: |
      performance
      accessibility
```

A common build step involves the [`wp dist-archive`](https://github.com/wp-cli/dist-archive-command/) command.
In combination with Plugin Check it could be used like this:

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v3

  # Here's where you would run your custom build process
  # ...
  # ...

  - name: Setup PHP
    uses: shivammathur/setup-php@v2
    with:
        php-version: latest
        coverage: none
        tools: wp-cli

  - name: Install latest version of dist-archive-command
    run: wp package install wp-cli/dist-archive-command:@stable

  - name: Build plugin
    run: |
      wp dist-archive . ./my-awesome-plugin.zip
      mkdir tmp-build
      unzip my-awesome-plugin.zip -d tmp-build

  - name: Run plugin check
    uses: wordpress/plugin-check-action@v1.0.6
    with:
      build-dir: './tmp-build/my-awesome-plugin'
```

### Supported Checks

At the time of writing, the following checks exist:

* `i18n_usage`
* `code_obfuscation`
* `direct_db_queries`
* `enqueued_scripts_in_footer`
* `enqueued_scripts_size`
* `enqueued_styles_scope`
* `file_type`
* `late_escaping`
* `localhost`
* `no_unfiltered_uploads`
* `performant_wp_query_params`
* `plugin_header_text_domain`
* `plugin_readme`
* `plugin_review_phpcs`
* `plugin_updater`
* `trademarks`

### Supported Categories

At the time of writing, the following categories exist:

* `accessibility`
* `general`
* `performance`
* `plugin_repo`
* `security`
